# Task — Sviluppatore 1: Scanner Nutrizionale

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase, lucide-react).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `Food` (id, name, category union, kcal, carbs, protein, fat, unit `"100g" \| "pz"`) | `app/today/_lib/types.ts` | Il prodotto scansionato deve essere convertito **in questo tipo**, non in uno nuovo. |
| `foodDatabase` statico (24 alimenti) | `app/today/_lib/data.ts` | Lo scanner **non** deve scriverci dentro: i prodotti OFF vivono solo in memoria + nella riga di diario. |
| `addEntry(food, quantity)` salva `food` come **jsonb** su Supabase | `app/today/_lib/DiaryContext.tsx` | Nessuna migrazione DB necessaria: campi extra opzionali su `Food` passano già così come sono. |
| `FoodPicker` riceve solo `onAdd` | `app/nutrition/page.tsx` | L'integrazione scanner è **interna a FoodPicker**: la pagina non cambia. |
| `FoodDiary` riceve `entries/totals/onRemove(id: string)` | idem | Cambia solo la resa visiva della singola voce. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Ogni prompt include l'obbligo di leggere `node_modules/next/dist/docs/` prima di scrivere route handler o config. |

### Le 3 decisioni architetturali da rispettare

1. **La chiamata a Open Food Facts passa da un Route Handler, mai dal browser.** OFF richiede un header `User-Agent` nella forma `AppName/Version (email)`; il browser **non permette** di impostare `User-Agent` da `fetch`, e in più chiamare OFF dal client espone a problemi CORS e al rate limit per-IP dell'utente. Server-side risolve tutto e in più permette il caching.
2. **Rate limit reale: 15 richieste/min/IP** sugli endpoint prodotto. Serve cache (`next: { revalidate }`) + debounce + gestione esplicita del 429.
3. **Il decoder è a due livelli**: `BarcodeDetector` nativo (Chrome/Android, zero KB di bundle) con fallback dinamico a `@zxing/browser` (Safari/iOS, Firefox). L'import di ZXing deve essere `await import(...)` per non pesare sul bundle di chi non ne ha bisogno.

### Librerie da installare

```bash
npm i @zxing/browser@^0.2.1 @zxing/library@^0.23.0
npm i -D @types/dom-webcodecs   # opzionale, solo se TS si lamenta di BarcodeDetector
```

Nient'altro. `lucide-react` (icone `ScanLine`, `Camera`, `X`, `Loader2`) e `next/image` sono già presenti. Nessun SDK a pagamento, nessun wrapper React di terze parti.

> Nota HTTPS: `getUserMedia` funziona solo su `localhost` o HTTPS. Per provare dal telefono sulla LAN serve `next dev --experimental-https` (verificare il flag nei docs della versione installata) o un tunnel.

---

## MICRO-PROMPT 1 — Backend: tipo, route handler OFF, mapper

Copia da qui:

```
Lavora sul repo fitness-app. Task: livello dati dello scanner nutrizionale. NON toccare ancora nessun componente UI.

Prima di scrivere il route handler leggi la documentazione della versione di Next installata in node_modules/next/dist/docs/ (route handlers + dynamic params + fetch caching): questa versione ha breaking change rispetto a quello che credi di sapere. In particolare verifica se `params` nei route handler è una Promise da awaitare.

1) Installa le dipendenze:
   npm i @zxing/browser@^0.2.1 @zxing/library@^0.23.0

2) In app/today/_lib/types.ts estendi l'interfaccia Food con SOLO campi opzionali (retrocompatibili con le righe jsonb già salvate su Supabase):
   brand?: string;
   barcode?: string;
   imageUrl?: string;
   source?: "local" | "off";
   servingHint?: number;   // grammi di una porzione suggerita, da serving_size
   incomplete?: boolean;   // true se mancano macro e l'utente deve completarle a mano
   Non modificare i campi esistenti e non toccare l'union `category`.

3) Crea app/nutrition/_lib/off.ts con:
   - `export interface OffProduct` (shape minima della risposta OFF che ci serve)
   - `export function isValidBarcode(code: string): boolean` → /^\d{8,14}$/ più validazione del check digit EAN-13/EAN-8 (rifiuta codici con checksum sbagliato: evita richieste inutili con il rate limit a 15/min)
   - `export function mapOffToFood(p: OffProduct): Food` con questa logica esatta:
     * name: product_name_it || product_name || `Prodotto ${code}`
     * kcal per 100g: nutriments["energy-kcal_100g"]; se assente e c'è nutriments["energy_100g"] (kJ) usa energy_100g / 4.184; se manca tutto → 0 e incomplete: true
     * carbs: nutriments["carbohydrates_100g"] ?? 0
     * protein: nutriments["proteins_100g"] ?? 0
     * fat: nutriments["fat_100g"] ?? 0
     * incomplete: true se manca anche solo uno tra kcal/carbs/protein/fat
     * unit: sempre "100g" (OFF normalizza per 100g/100ml)
     * id: `off:${code}`  — prefisso obbligatorio per non collidere con gli id di foodDatabase
     * barcode, brand (brands, primo valore prima della virgola, trimmato), imageUrl (image_front_small_url), source: "off"
     * servingHint: parse numerico di serving_size (es. "30 g" → 30, "1 barretta (21 g)" → 21); undefined se non parsabile
     * category: mappa euristica da categories_tags verso l'union esistente
       ("en:beverages"→bevande, "en:fruits"→frutta, "en:vegetables"→verdure,
        "en:meats"|"en:fishes"|"en:cheeses"|"en:eggs"→proteine,
        "en:breakfasts"|"en:cereals"|"en:breads"→colazione,
        "en:pastas"|"en:rice"|"en:legumes"→carboidrati, default→snack)
     * Arrotonda tutti i macro a 1 decimale e le kcal a intero.
   - Nessuna dipendenza React in questo file: deve essere puro e testabile.

4) Crea il route handler app/api/off/[barcode]/route.ts:
   - GET, runtime nodejs
   - valida il barcode con isValidBarcode → 400 { error: "invalid_barcode" } se non valido
   - URL: https://world.openfoodfacts.org/api/v2/product/${barcode}.json con query
     fields=code,product_name,product_name_it,brands,quantity,serving_size,image_front_small_url,nutriments,categories_tags
     (il parametro fields riduce la risposta da ~100KB a ~1KB: non ometterlo)
   - headers: { "User-Agent": "FitnessApp/0.1 (fuocoluke@gmail.com)" }  ← obbligatorio, OFF lo richiede
   - timeout: signal: AbortSignal.timeout(6000)
   - caching: next: { revalidate: 86400 } sulla fetch (i valori nutrizionali di un prodotto non cambiano di ora in ora, e la cache è la difesa principale contro il rate limit di 15 req/min/IP)
   - Mappa gli esiti così, sempre con Content-Type JSON:
     * OFF risponde status:0 oppure HTTP 404 → 404 { error: "not_found", barcode }
     * OFF risponde 429 → 429 { error: "rate_limited" }
     * AbortError/timeout → 504 { error: "timeout" }
     * qualsiasi altro throw → 502 { error: "upstream_error" }
     * successo → 200 { food: Food }  (usa mapOffToFood)
   - Logga gli errori con console.error("[off]", ...) coerentemente con lo stile di DiaryContext.

5) Verifica prima di dichiarare finito:
   - npx tsc --noEmit && npm run lint
   - avvia npm run dev e prova con curl:
     * /api/off/3017624010701  (Nutella, deve tornare 200 con kcal ~539)
     * /api/off/0000000000000  (deve tornare 404 not_found)
     * /api/off/abc            (deve tornare 400 invalid_barcode)
   Incolla le 3 risposte nel riepilogo finale.
```

---

## MICRO-PROMPT 2 — Componente `BarcodeScanner`

```
Lavora sul repo fitness-app. Task: componente fotocamera per la lettura del codice a barre. NON modificare ancora FoodPicker.

Crea app/nutrition/_components/BarcodeScanner.tsx, "use client", con questa API:

  interface BarcodeScannerProps {
    open: boolean;
    onClose: () => void;
    onDetected: (barcode: string) => void;   // chiamato UNA sola volta per apertura
  }

Requisiti implementativi:

1) Decoder a due livelli, deciso a runtime:
   - se "BarcodeDetector" in window: usa il detector nativo con
     formats: ["ean_13", "ean_8", "upc_a", "upc_e"]
     e un loop di scansione ogni 250ms (setInterval o requestAnimationFrame con throttle) su un <video> in autoPlay playsInline muted.
   - altrimenti: const { BrowserMultiFormatReader } = await import("@zxing/browser")
     — import DINAMICO obbligatorio, così ZXing non entra nel bundle di chi ha il detector nativo.
     Configura ZXing con gli stessi formati via DecodeHintType.POSSIBLE_FORMATS da @zxing/library.
   - Dichiara i tipi di BarcodeDetector in un file app/nutrition/_lib/barcode-detector.d.ts se TypeScript non li conosce.

2) Camera:
   - getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } } })
   - overlay con riquadro di mira centrale (bordo emerald, angoli arrotondati) e testo "Inquadra il codice a barre"
   - CLEANUP RIGOROSO: allo unmount, alla chiusura e al primo rilevamento ferma tutte le track (stream.getTracks().forEach(t => t.stop())), pulisci l'interval e resetta il reader ZXing. Una camera lasciata accesa è il bug più comune di questa feature.
   - Guardia anti-doppio-scan: un useRef<boolean> che blocca ulteriori onDetected dopo il primo.
   - Feedback al rilevamento: navigator.vibrate?.(60) e un flash verde di 150ms prima di chiudere.

3) Gestione errori, tutti renderizzati DENTRO il componente (mai un throw, mai un alert()):
   - NotAllowedError (permesso negato) → messaggio "Permesso fotocamera negato" + istruzione a sbloccarlo dal lucchetto della barra indirizzi + input manuale
   - NotFoundError / nessuna camera → "Nessuna fotocamera disponibile" + input manuale
   - contesto non sicuro (window.isSecureContext === false) → "La fotocamera richiede HTTPS" + input manuale
   - In OGNI stato di errore, e anche in fondo alla vista normale, mostra un input manuale:
     <input inputMode="numeric" pattern="[0-9]*"> + bottone "Cerca" che chiama onDetected(valore) se il codice ha 8-14 cifre.
     Questo input è il fallback che rende la feature usabile sempre, anche da desktop senza webcam.

4) Chiusura: bottone X in alto a destra, tasto Escape, e click sul backdrop. Blocca lo scroll del body mentre è aperto.

5) Stile: coerente con il resto dell'app — palette emerald, rounded-2xl, border-emerald-900/10, shadow-sm, testi font-bold uppercase tracking-widest per le label. Guarda app/today/_components/Modal.tsx e riusalo se l'API combacia, altrimenti fai un overlay fixed inset-0 z-50 bg-black/80 autonomo.

6) Verifica: npx tsc --noEmit && npm run lint. Poi apri il componente in dev su localhost, concedi la camera, e conferma nei DevTools (tab Network → nessuna richiesta a zxing se il browser è Chrome) e che dopo la chiusura l'indicatore della webcam si spenga.
```

---

## MICRO-PROMPT 3 — Integrazione in `FoodPicker` e `FoodDiary`

```
Lavora sul repo fitness-app. Task: collegare scanner + API OFF alla UI esistente. Non cambiare le props di FoodPicker/FoodDiary né la firma di addEntry/removeEntry.

A) app/nutrition/_components/FoodPicker.tsx

  1. Nuovi stati:
     const [scannerOpen, setScannerOpen] = useState(false);
     const [scanned, setScanned] = useState<Food[]>([]);        // prodotti OFF di questa sessione
     const [lookup, setLookup] = useState<{ status: "idle"|"loading"|"error"; message?: string; barcode?: string }>({ status: "idle" });

  2. Accanto alla barra di ricerca (stessa riga, flex) aggiungi un bottone con icona ScanLine di lucide-react, aria-label "Scansiona codice a barre", stile bg-emerald-600 text-white rounded-xl px-3, che fa setScannerOpen(true).

  3. handleDetected(barcode: string):
     - setScannerOpen(false); setLookup({ status: "loading", barcode })
     - se il barcode è già in `scanned`, riusalo senza chiamare l'API (risparmia rate limit)
     - altrimenti fetch(`/api/off/${barcode}`) e gestisci gli status del route handler:
       * 200 → const { food } = await res.json();
               setScanned(prev => [food, ...prev.filter(f => f.barcode !== food.barcode)]);
               setSelectedFood(food);
               setQuantity(String(food.servingHint ?? 100));
               setLookup({ status: "idle" });
       * 404 → setLookup({ status: "error", barcode, message: "Prodotto non trovato su Open Food Facts." })
       * 429 → "Troppe richieste, riprova tra un minuto."
       * 504 → "Timeout: connessione lenta." con bottone "Riprova" che rilancia handleDetected(barcode)
       * altro → "Errore nel recupero dei dati."
     - Il pannello di errore deve sempre offrire due vie d'uscita: "Riprova" e "Inserisci a mano" (che apre il pannello porzione con un Food vuoto editabile, id `manual:${Date.now()}`, source "off" escluso, category "snack").

  4. Lista alimenti: sostituisci `foodDatabase.filter(...)` con un useMemo su `[...scanned, ...foodDatabase]`, mantenendo identici i filtri di categoria e query. I prodotti scansionati vanno in cima, con una piccola pill "Scansionato" e il brand sotto il nome. Aggiungi `scanned` alle deps del useMemo.

  5. Pannello porzione: se selectedFood.incomplete === true, mostra un avviso ambra "Dati nutrizionali incompleti" e rendi editabili i 4 valori (kcal/carbs/protein/fat per 100g) con input numerici; al click su "Aggiungi al diario" passa a onAdd un oggetto Food con i valori corretti dall'utente e incomplete: false. Se invece i dati sono completi, il pannello resta esattamente com'è oggi.

  6. Se selectedFood.imageUrl esiste, mostra la miniatura 40x40 rounded-lg accanto al nome nel pannello porzione. Usa next/image e ricorda di aggiungere images.remotePatterns per `images.openfoodfacts.org` in next.config.ts (verifica la sintaxi corretta per questa versione di Next nei docs in node_modules) — oppure, se preferisci evitare la config, usa una <img> normale con loading="lazy".

  7. handleAdd resta invariato nella sostanza: onAdd(selectedFood, qNum). Il food OFF viene già serializzato come jsonb da DiaryContext, quindi non serve nessuna modifica lato Supabase.

  8. Renderizza <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={handleDetected} /> in fondo al componente.

B) app/nutrition/_components/FoodDiary.tsx

  1. Sotto il nome dell'alimento, se e.food.brand esiste, mostralo in text-xs text-emerald-800/40.
  2. Se e.food.source === "off", aggiungi una pill con icona ScanLine (h-3 w-3) accanto al nome.
  3. Difendi il calcolo kcal dai NaN: const kcal = Number.isFinite(x) ? Math.round(x) : 0. Le voci OFF possono avere macro mancanti nelle righe già salvate.
  4. Se e.food.imageUrl esiste, mostra una miniatura 32x32 rounded-lg a sinistra del nome.
  5. NON cambiare props, firma di onRemove, layout dei totali.

C) Verifica finale, obbligatoria prima di dichiarare il task chiuso:
  - npx tsc --noEmit && npm run lint (zero errori)
  - npm run build deve passare
  - Flusso manuale su /nutrition:
      1. bottone scanner → input manuale → 3017624010701 → il prodotto compare selezionato con kcal 539 e porzione precompilata
      2. "Aggiungi al diario" → la voce appare in FoodDiary con brand e pill scanner, e i totali si aggiornano
      3. ricarica la pagina → la voce è ancora lì (verifica che il jsonb su Supabase contenga i campi barcode/brand/source)
      4. barcode 0000000000000 → messaggio "Prodotto non trovato" con i bottoni Riprova / Inserisci a mano
      5. rimuovi la voce → sparisce e i totali tornano a zero
  - Riporta l'esito dei 5 punti nel riepilogo.
```

---

## Note di attenzione da tenere d'occhio in review

- **`User-Agent` hardcodato**: spostalo in una env var (`OFF_USER_AGENT`) se il repo diventa pubblico o va in produzione.
- **Rate limit**: 15 req/min/IP. In produzione su Vercel l'IP è condiviso tra tutti gli utenti della stessa funzione → se l'app cresce, la cache `revalidate: 86400` non basta più e serve una tabella `off_products` su Supabase come cache persistente. Per ora è sovradimensionato.
- **Precisione dei dati OFF**: sono crowdsourced. Prodotti italiani di marca sono ben coperti, sfusi e prodotti locali spesso no — per questo il percorso "inserisci a mano" non è un ripiego ma parte della feature.
- **`unit: "100g"` per i liquidi**: OFF normalizza le bevande per 100ml. La UI dirà "grammi" anche per il latte. Accettabile ora; se dà fastidio, il fix è aggiungere `"100ml"` all'union `unit` e propagarlo in FoodPicker/FoodDiary/DiaryContext.calcNutrients.

## Fonti

- [Open Food Facts — Introduction to the API](https://openfoodfacts.github.io/openfoodfacts-server/api/) (User-Agent obbligatorio, rate limit 15 req/min/IP sui prodotti)
- [Open Food Facts — API tutorial](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorial-off-api/)
- [@zxing/browser su npm](https://www.npmjs.com/package/@zxing/browser) — v0.2.1
- [@zxing/library su npm](https://www.npmjs.com/package/@zxing/library) — v0.23.0
