# Task — Sviluppatore 3: Gamification & Social (Achievement + Condivisione Esterna)

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase, lucide-react, recharts).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `useWorkoutSession()` espone `logs: DetailedWorkoutLog[]` (ultimi 200, `date desc`), `records: ExerciseRecord[]`, `stats { streak, thisMonthCount, last }`, `lastPR`, `dismissPR` | `app/today/_lib/WorkoutSessionContext.tsx` | **Tutti i dati per i badge sono già in RAM.** Nessuna nuova query, nessun nuovo provider. `stats.streak` esiste già: non ricalcolarlo. |
| `ExerciseRecord { exerciseId, name, maxWeight, e1rm, bestSetVolume, date }` + `buildAllRecords` | `app/today/_lib/prStats.ts` | "Club 100 kg" si legge da `records.maxWeight`, **non** riscorrendo i log. |
| `setVolume(set)`, `logVolume(log)`, `logsInPeriod` | `app/today/_lib/volumeStats.ts` | I badge di volume riusano `logVolume`. Non duplicare la formula. |
| `useDiary()` espone `dailyKcalHistory: { date, kcal }[]` (ultimi 7 giorni) e `todayTotals` | `app/today/_lib/DiaryContext.tsx` | "Prima settimana chiusa" è misurabile **solo** su questa finestra di 7 giorni: è il dato disponibile, non inventarne altri. |
| `useUser()` espone `goals.kcalTarget`, `profile.name`, `profile.avatar` | `app/today/_lib/UserContext.tsx` | `profile.avatar` è un URL esterno → ⚠️ **taint del canvas** (vedi decisione 3). |
| `PRToast.tsx` — pattern toast già in uso: `role="status"`, `aria-live="polite"`, auto-dismiss 6s, `fixed inset-x-4 bottom-24 z-50` | `app/allenamento/_components/PRToast.tsx` | L'eventuale `AchievementToast` **copia questo pattern**, non ne inventa uno nuovo. |
| `/profilo` esiste già come `"use client"` con `StatsCard`, `WeightHistoryChart`, `ProfileForm`, `GoalsForm` | `app/profilo/page.tsx` | `/profilo/achievements` è una **sottorotta nuova**, non una modifica di `/profilo` (a parte un link). |
| `Sidebar.tsx` ha già 6 voci | `app/_components/Sidebar.tsx` | **Non aggiungere una settima voce.** L'ingresso agli achievement è un link dentro `/profilo`. |
| `handleFinish()` in `/allenamento` fa `await finishSession(...)` poi `router.push("/today")` | `app/allenamento/page.tsx` | Il momento "fine allenamento" **non ha una schermata di riepilogo**: la condivisione va agganciata su `/today`, sul log più recente. |
| Palette e stile: `bg-[#FAF7F0]`, card `rounded-2xl border border-emerald-900/5 bg-white shadow-sm`, titoli `text-xs font-bold uppercase tracking-widest text-emerald-800/70` | tutto il repo | La griglia badge e la card social devono usare questa palette, non introdurne una nuova. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Leggere `node_modules/next/dist/docs/` prima di scrivere route/config. Consultare `graph.json` prima di ogni import. |

### Schema Supabase coinvolto

| Tabella | Colonne usate | Note per questo task |
|---|---|---|
| `workout_logs` | `date`, `session_name`, `duration_seconds`, `exercises` (jsonb) | Fonte di sessioni, volume, durata, esercizi distinti. **Sola lettura.** |
| `diary_entries` | — (via `dailyKcalHistory`) | Fonte del badge nutrizione. **Sola lettura.** |
| `profiles` | `plan` (jsonb) | **Non toccata.** Nessuna colonna `achievements`. |

⚠️ Nessuna tabella nuova, nessuna migrazione SQL, nessuna RLS da scrivere in questo task.

### Le 3 decisioni architetturali da rispettare

1. **Gli achievement sono DERIVATI, non persistiti.** Un badge è una funzione pura di dati già presenti (`logs`, `records`, `stats`, `dailyKcalHistory`). Creare una tabella `user_achievements` significherebbe: una migrazione, una RLS, una scrittura da mantenere sincronizzata a ogni `finishSession`, e un bug garantito il giorno in cui l'utente cancella un log (badge fantasma che resta sbloccato). Derivandoli, la verità è sempre una sola. **L'unica cosa persistita è il flag "già celebrato"**, in `localStorage` (`fitapp:achievements:seen`), perché è stato di UI puramente locale al dispositivo e non merita un round-trip di rete.
2. **Un solo passaggio sui log → `AchievementTotals` memoizzata.** Stessa regola del motore di progressione: si costruisce **una volta** un oggetto di aggregati (sessioni, volume totale, esercizi distinti, durata max, prima data) scorrendo i log in O(set totali); ogni definizione di badge poi legge da lì in O(1). Se una `measure()` riceve `logs` e li riscorre, il catalogo diventa O(n·m) a ogni render. Il file del motore è puro: **zero import di React, next/*, supabase, lucide-react**.
3. **La card social si disegna con Canvas 2D nativo, non con `html-to-image`.** Motivi concreti: (a) `profile.avatar` è cross-origin → `html-to-image` produce un canvas *tainted* e `toBlob()` lancia `SecurityError`; (b) i webfont vanno inlinati a mano o l'export esce in Times New Roman; (c) su iOS Safari il rendering di `foreignObject` è notoriamente inaffidabile proprio sul device dove si condivide su Instagram; (d) è una dipendenza in più per disegnare 6 stringhe e 3 rettangoli. Un canvas 1080×1350 disegnato imperativamente è deterministico, testabile e a dipendenze zero.

### Librerie da installare

**Nessuna.** Niente `html-to-image`, niente `dom-to-image`, niente `canvas`. Le icone (`Trophy`, `Lock`, `Flame`, `Dumbbell`, `Share2`, `Download`, `Medal`, `Target`, `Zap`) sono già in `lucide-react`. Le verifiche girano con `npx --yes tsx` su file temporanei, poi cancellati.

---

## MICRO-PROMPT 1 — Motore puro: `achievements.ts`

Copia da qui:

```
Lavora sul repo fitness-app. Task: catalogo e motore degli achievement, livello logico. NON toccare nessun componente UI, nessun context, nessuna query Supabase, non creare pagine in questo step.

Consulta graph.json e leggi prima questi file, per riusarli e NON duplicarli:
 - app/today/_lib/types.ts       (CompletedSet, CompletedExercise, DetailedWorkoutLog)
 - app/today/_lib/prStats.ts     (ExerciseRecord, setMaxWeight)
 - app/today/_lib/volumeStats.ts (setVolume, logVolume)

Crea app/today/_lib/achievements.ts. Vincoli: nessun import di React, di next/*, di supabase, di lucide-react. File puro e testabile, stesso stile di prStats.ts (commenti in italiano, funzioni esportate singolarmente).

1) Tipi esportati:

   export type AchievementCategory = "forza" | "costanza" | "volume" | "nutrizione" | "traguardi";

   /** Chiave icona: la mappatura a lucide-react avviene NEL COMPONENTE, non qui. */
   export type AchievementIcon =
     | "trophy" | "flame" | "dumbbell" | "medal" | "target" | "zap" | "apple" | "clock" | "compass";

   export interface AchievementTotals {
     sessions: number;            // numero di log
     totalVolume: number;         // somma di logVolume su tutti i log
     distinctExercises: number;   // exerciseId unici mai eseguiti
     longestSessionSec: number;   // max durationSeconds
     bestSingleWeight: number;    // max setMaxWeight su tutti i set
     firstDate: string | null;    // ISO YYYY-MM-DD del log più vecchio
     lastDate: string | null;     // ISO del più recente
     totalSets: number;
   }

   export interface AchievementInput {
     logs: DetailedWorkoutLog[];
     records: ExerciseRecord[];
     streak: number;                              // da stats.streak, NON ricalcolarlo
     dailyKcal: { date: string; kcal: number }[]; // da dailyKcalHistory (7 giorni)
     kcalTarget: number;
   }

   export interface AchievementDef {
     id: string;
     title: string;         // max 24 caratteri, italiano
     description: string;   // la condizione, max 70 caratteri
     category: AchievementCategory;
     icon: AchievementIcon;
     target: number;        // valore da raggiungere
     unit: string;          // "kg" | "giorni" | "sessioni" | "t" | "esercizi" | "min"
     /** O(1): legge SOLO da totals/input pre-aggregati. Mai un loop sui log qui dentro. */
     measure: (t: AchievementTotals, i: AchievementInput) => number;
   }

   export interface AchievementStatus {
     def: AchievementDef;
     value: number;       // valore corrente
     unlocked: boolean;   // value >= target
     progress: number;    // 0..1, clampato
   }

2) export function buildAchievementTotals(logs: DetailedWorkoutLog[]): AchievementTotals
   - UN SOLO passaggio: logs → exercises → sets
   - usa logVolume (da volumeStats) e setMaxWeight (da prStats), non riscriverli
   - distinctExercises via Set<string>
   - se logs è vuoto ritorna tutti 0 e firstDate/lastDate null

3) export const ACHIEVEMENTS: AchievementDef[] — catalogo statico, ordinato per categoria.
   Definisci ESATTAMENTE questi 12, con questi id (li usa la UI e il localStorage):

   forza:
     "club-60"      Club 60 kg     · target 60,  unit "kg"       · measure: max(records.maxWeight)
     "club-100"     Club 100 kg    · target 100, unit "kg"       · idem
     "club-140"     Club 140 kg    · target 140, unit "kg"       · idem
     "pr-hunter"    Cacciatore PR  · target 10,  unit "record"   · records.length
   costanza:
     "streak-3"     Streak 3       · target 3,   unit "giorni"   · i.streak
     "streak-7"     Streak 7       · target 7,   unit "giorni"   · i.streak
     "streak-30"    Streak 30      · target 30,  unit "giorni"   · i.streak
   volume:
     "ton-10"       10 tonnellate  · target 10,  unit "t"        · t.totalVolume / 1000
     "ton-100"      100 tonnellate · target 100, unit "t"        · idem
   nutrizione:
     "week-closed"  Prima settimana chiusa · target 7, unit "giorni"
                    measure: numero di giorni in i.dailyKcal con kcal > 0
                    description: "7 giorni consecutivi con il diario compilato."
   traguardi:
     "first-blood"  Primo allenamento · target 1,  unit "sessioni" · t.sessions
     "centurion"    Centurione        · target 100, unit "sessioni" · t.sessions

   Regola: se un measure ti costringe a scorrere i log, hai sbagliato — aggiungi il dato a AchievementTotals.

4) export function evaluateAchievements(input: AchievementInput): AchievementStatus[]
   - chiama buildAchievementTotals UNA volta
   - mappa ACHIEVEMENTS → AchievementStatus
   - progress = Math.min(value / target, 1), con target > 0 garantito
   - value arrotondato a 1 decimale per le tonnellate, intero per il resto
   - l'ordine dell'array in uscita è quello di ACHIEVEMENTS (stabile, la UI non riordina)

5) export function unlockedIds(list: AchievementStatus[]): string[]
   - solo gli id sbloccati, per il diff con localStorage lato UI

6) Verifica, obbligatoria prima di dichiarare finito:
   - npx tsc --noEmit && npm run lint → zero errori
   - crea scripts/achievements.check.ts (in memoria, nessuna rete) e stampa OK/FAIL per:
     1. input completamente vuoto → 12 status, tutti unlocked=false, progress=0
     2. records con maxWeight 105 → "club-60" e "club-100" unlocked, "club-140" no, progress club-140 = 105/140
     3. streak 7 → "streak-3" e "streak-7" unlocked, "streak-30" progress ≈ 0.233
     4. dailyKcal con 7 giorni tutti > 0 → "week-closed" unlocked; con 6 su 7 → progress 6/7
     5. un log da 12.000 kg di volume → "ton-10" progress 1.2 clampato a 1, unlocked true
     6. 3 log con gli stessi 2 esercizi → distinctExercises === 2 (non 6)
     7. buildAchievementTotals su 200 log finti gira in < 50 ms (console.time)
   - eseguilo con: npx --yes tsx scripts/achievements.check.ts
   - incolla l'output nel riepilogo, poi CANCELLA il file e verifica con git status.
```

---

## MICRO-PROMPT 2 — Hook `useAchievements`, badge e pagina `/profilo/achievements`

```
Lavora sul repo fitness-app. Task: esporre gli achievement alla UI e creare la pagina griglia. NON toccare WorkoutSessionContext, DiaryContext, UserContext. Nessuna nuova query Supabase, nessun nuovo provider, nessuna voce nuova nella Sidebar.

A) Crea app/today/_lib/useAchievements.ts ("use client"):

   export function useAchievements() {
     const { logs, records, stats } = useWorkoutSession();  // ./WorkoutSessionContext
     const { dailyKcalHistory } = useDiary();               // ./DiaryContext
     const { goals } = useUser();                           // ./UserContext
     const list = useMemo(() => evaluateAchievements({
       logs, records, streak: stats.streak,
       dailyKcal: dailyKcalHistory, kcalTarget: goals.kcalTarget,
     }), [logs, records, stats.streak, dailyKcalHistory, goals.kcalTarget]);
     return { list, unlockedCount, total: list.length };
   }

   Requisiti:
   - derivazione pura: nessun useState, nessun useEffect, nessuna fetch
   - evaluateAchievements gira UNA sola volta per cambio di deps. Se lo chiami dentro un .map(), rifallo.
   - unlockedCount = list.filter(a => a.unlocked).length, calcolato dentro lo stesso useMemo

B) Crea app/profilo/achievements/_components/AchievementBadge.tsx ("use client"):

   interface AchievementBadgeProps { status: AchievementStatus }

   - mappa icona: const ICONS: Record<AchievementIcon, LucideIcon> = { trophy: Trophy, flame: Flame, ... }
     Questa mappa vive QUI, non in achievements.ts.
   - SBLOCCATO: cerchio h-14 w-14 rounded-full bg-amber-100 con icona h-6 w-6 text-amber-600,
     titolo text-sm font-bold text-emerald-950, descrizione text-[11px] text-emerald-800/60.
   - BLOCCATO: stesso layout ma cerchio bg-[#FAF7F0], icona Lock h-5 w-5 text-emerald-800/30,
     titolo text-emerald-800/40, e sotto una barra di progresso:
       traccia h-1 rounded-full bg-emerald-900/5, riempimento bg-teal-500 con style width `${progress*100}%`
       + label tabular-nums `${value} / ${target} ${unit}`
     La barra NON si mostra se progress === 0 (rumore inutile).
   - contenitore: rounded-2xl border border-emerald-900/5 bg-white p-4 text-center shadow-sm, transition
   - accessibilità: role="listitem", aria-label che dica esplicitamente "sbloccato"/"bloccato" + progresso.
     Il progresso NON deve essere veicolato dal solo colore.
   - Nessun import di Supabase né di useAchievements qui dentro: lo status arriva per prop.

C) Crea app/profilo/achievements/page.tsx + _components/AchievementGrid.tsx

   page.tsx: SERVER component (nessun "use client"), stessa shell di app/stats/page.tsx —
     main bg-[#FAF7F0] px-4 py-6 pb-24 md:px-8 md:py-10, contenitore mx-auto max-w-5xl space-y-6,
     back link con ArrowLeft verso "/profilo" (non "/today"), titolo "Traguardi",
     sottotitolo "I badge che hai sbloccato". Poi <AchievementGrid />.

   AchievementGrid.tsx ("use client"):
     - const { list, unlockedCount, total } = useAchievements();
     - in testa una card riepilogo: "X di Y sbloccati" + barra di progresso complessiva
     - griglia raggruppata per category, con intestazione di sezione nello stile del repo
       (text-xs font-bold uppercase tracking-widest text-emerald-800/70)
     - grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4, role="list"
     - ordine: sbloccati PRIMA dei bloccati dentro ogni categoria (sort stabile, non mutare `list`:
       usa [...items].sort(...))

D) In app/profilo/page.tsx aggiungi SOLO un link alla nuova pagina, sotto <StatsCard />:
   una riga cliccabile rounded-2xl border border-emerald-900/5 bg-white p-4 shadow-sm con
   icona Trophy, testo "Traguardi" e ChevronRight a destra. Non toccare altro in questa pagina.

E) Verifica:
   - npx tsc --noEmit && npm run lint && npm run build → zero errori
   - manuale: /profilo → clicca "Traguardi" → la griglia si apre; utente senza storico vede
     12 badge tutti bloccati e nessun crash; DevTools Network durante l'apertura: ZERO richieste
     nuove verso Supabase (prova che tutto è derivato dai dati già in memoria).
```

---

## MICRO-PROMPT 3 — Card condivisibile: `shareCard.ts` + `ShareButton`

```
Lavora sul repo fitness-app. Task: generatore di card immagine per Instagram/WhatsApp. NON installare html-to-image né altre dipendenze. Non modificare WorkoutSessionContext, non aggiungere rotte API, non salvare nulla su Supabase o su storage.

A) Crea app/today/_lib/shareCard.ts — canvas puro, nessun import di React/next/supabase.

   export const SHARE_W = 1080;
   export const SHARE_H = 1350;   // 4:5, formato feed Instagram

   export interface ShareCardData {
     title: string;        // es. "Push A" o "Club 100 kg"
     subtitle: string;     // es. "Martedì 3 settembre"
     stats: { label: string; value: string }[];  // MAX 3, già formattati (es. "48 min", "6.200 kg", "18 set")
     highlight?: string;   // es. "Nuovo record: Panca 105 kg"
     userName: string;
   }

   export async function drawShareCard(data: ShareCardData): Promise<Blob>

   Implementazione, nell'ordine:
     1. await document.fonts.ready  — ALTRIMENTI il testo esce con il font di fallback
     2. canvas = document.createElement("canvas"); w/h = SHARE_W/SHARE_H; ctx = getContext("2d")
        se ctx è null → throw new Error("Canvas non disponibile")
     3. sfondo: gradiente verticale createLinearGradient da "#FAF7F0" a "#E8F3EE"
     4. card interna bianca: rect arrotondato (usa ctx.roundRect, disponibile in tutti i browser
        target di Next 16; se il lint segnala il tipo, non fare un polyfill, aggiusta il tsconfig lib)
        inset 64px, raggio 48, fill "#FFFFFF"
     5. testi, font stack di sistema (NON un webfont):
        const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        - eyebrow "FITAPP" 32px bold, letterSpacing, fill "#0f766e" (teal-700)
        - title 88px bold fill "#022c22" (emerald-950), con wrap manuale a 2 righe max
          (scrivi un helper wrapText(ctx, text, maxWidth, maxLines) e troncalo con "…")
        - subtitle 36px fill "rgba(6,78,59,0.6)"
     6. le stats: fino a 3 riquadri affiancati, fill "#FAF7F0" raggio 24, valore 56px bold, label 26px uppercase
     7. highlight (se presente): pill fill "#FEF3C7" (amber-100), testo 32px bold "#b45309"
     8. footer: `@${data.userName}` 30px, fill "rgba(6,78,59,0.4)", in basso a sinistra
     9. NON disegnare profile.avatar né nessuna immagine remota: è cross-origin, sporca il canvas
        e toBlob() lancerebbe SecurityError. Se serve un tocco personale usa le INIZIALI del nome
        dentro un cerchio disegnato.
    10. return await new Promise<Blob>((res, rej) =>
          canvas.toBlob(b => b ? res(b) : rej(new Error("toBlob fallito")), "image/png"));

   export async function shareOrDownload(blob: Blob, filename: string): Promise<"shared" | "downloaded">
     - const file = new File([blob], filename, { type: "image/png" });
     - se navigator.canShare?.({ files: [file] }) → await navigator.share({ files: [file] }) → "shared"
       (avvolgi in try/catch: l'utente che annulla lo share lancia un AbortError, che NON è un errore
        da mostrare — intercettalo e ritorna "downloaded" senza scaricare nulla)
     - altrimenti: URL.createObjectURL → <a download> sintetico → click() → revokeObjectURL → "downloaded"
     - Web Share con file NON esiste su desktop: il fallback download è il percorso normale, non un errore.

B) Crea app/_components/ShareButton.tsx ("use client"):

   interface ShareButtonProps { data: ShareCardData; label?: string }

   - useState per "idle" | "working" | "error"
   - onClick → drawShareCard → shareOrDownload; disabilita il bottone durante "working"
   - stile coerente: inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5
     text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-50
   - icona Share2 (h-4 w-4), in stato "working" mostra "Genero…"
   - in caso di errore: messaggio inline text-[11px] text-red-600, MAI un alert()
   - type="button", aria-label esplicito.

C) Aggancio in app/today/_components/WorkoutCard.tsx:
   - const { logs } = useWorkoutSession(); const last = logs[0];
   - se `last` esiste, sotto i controlli già presenti renderizza:
       <ShareButton data={{
         title: last.sessionName,
         subtitle: formatShortDate(last.date),        // da ../_lib/utils, già esistente
         stats: [
           { label: "Durata", value: `${Math.round(last.durationSeconds / 60)} min` },
           { label: "Volume", value: `${Math.round(logVolume(last)).toLocaleString("it-IT")} kg` },
           { label: "Set",    value: String(last.exercises.reduce((s, e) => s + e.sets.length, 0)) },
         ],
         userName: profile.name,
       }} label="Condividi" />
   - se logs è vuoto NON renderizzare nulla: nessun bottone morto.
   - non cambiare le props di WorkoutCard, non toccare la logica di composeToday/resetTodayOverride.

D) Aggancio in app/profilo/achievements/_components/AchievementBadge.tsx:
   sui badge SBLOCCATI aggiungi in fondo un <ShareButton> compatto (solo icona + "Condividi",
   text-[11px], bg-transparent text-teal-700 hover:bg-teal-50) con
   data = { title: def.title, subtitle: "Traguardo sbloccato", stats: [{ label: def.unit, value: String(value) }], userName }.
   Sui bloccati: niente bottone.

E) Verifica finale, obbligatoria prima di dichiarare il task chiuso:
   - npx tsc --noEmit && npm run lint && npm run build → zero errori
   - Flusso manuale, in quest'ordine:
       1. utente senza log → /today: nessun bottone Condividi (regressione zero sulla card)
       2. completa un allenamento → torna su /today: il bottone appare
       3. desktop: click → si scarica un PNG 1080×1350; aprilo e verifica che titolo, data e le 3
          statistiche siano leggibili e non troncate male
       4. mobile (Vercel preview, iOS o Android): click → si apre il foglio di condivisione nativo,
          e Instagram/WhatsApp compaiono tra le destinazioni
       5. annulla lo share dal foglio nativo → NESSUN errore a schermo, nessun download parassita
       6. /profilo/achievements → un badge sbloccato → Condividi → PNG con il titolo del badge
       7. DevTools Console: zero SecurityError, zero warning sul canvas
   - Riporta l'esito dei 7 punti nel riepilogo.
```

---

## Note di attenzione da tenere d'occhio in review

- **`week-closed` misura 7 giorni, non "la prima settimana".** `dailyKcalHistory` è una finestra scorrevole sugli ultimi 7 giorni: il badge si sblocca quando *una* settimana è piena, e — essendo derivato — **si ri-blocca** se l'utente smette di compilare il diario. È coerente con la decisione 1 (nessuna persistenza), ma è un comportamento da conoscere. Se diventa fastidioso, la soluzione corretta è estendere `DiaryContext` con uno storico più lungo, **non** salvare il badge su Supabase.
- **`localStorage` per il flag "già celebrato".** È l'unica eccezione alla migrazione a Supabase, ed è deliberata: è stato di UI locale al dispositivo, non un dato dell'utente. Conseguenza accettata: cambiando dispositivo l'eventuale toast di sblocco si ripresenta una volta.
- **`stats.streak` è la fonte unica.** Se un giorno la definizione di streak cambia in `WorkoutSessionContext`, i tre badge costanza cambiano insieme, gratis. Non reimplementare il conteggio dentro `achievements.ts`.
- **`ctx.roundRect` e il tsconfig.** È standard e supportato ovunque nei target di Next 16, ma la lib DOM di TypeScript la include solo dalle versioni recenti. Se `tsc` protesta, si alza `lib` nel tsconfig: non si scrive un polyfill a mano né si torna a `moveTo`/`arcTo`.
- **Il canvas non deve mai vedere l'avatar.** È la trappola numero uno di questa feature: `toBlob()` su canvas sporcato lancia `SecurityError` **solo a runtime, solo in produzione, solo sul device dell'utente**. Iniziali disegnate, punto.
- **Web Share API richiede HTTPS e un gesto utente.** Funziona sulle preview Vercel, non su `http://localhost` da mobile. Non interpretare il fallback download in locale come un bug.
- **Nessun impatto su `prStats.ts` / `volumeStats.ts` / `WorkoutSessionContext.tsx`.** Il motore importa e non modifica. Se un prompt ti porta a editare quei file, ti sei allontanato dal task: fermati e rivedi.
- **Toast di sblocco: fuori scope.** Se lo aggiungi, copia `PRToast.tsx` (stesso posizionamento, stesso `aria-live`, stesso auto-dismiss) e coordina lo z-index: due toast sovrapposti a fine allenamento sono un difetto visibile.

## Riferimenti nel repo

- `app/today/_lib/prStats.ts` — `ExerciseRecord`, `setMaxWeight` (alimenta `PersonalRecordsCard`)
- `app/today/_lib/volumeStats.ts` — `setVolume`, `logVolume` (alimenta `VolumeChart`)
- `app/today/_lib/WorkoutSessionContext.tsx` — `logs`, `records`, `stats.streak`
- `app/today/_lib/DiaryContext.tsx` — `dailyKcalHistory` (alimenta `KcalWeekChart`)
- `app/today/_lib/UserContext.tsx` — `profile.name`, `goals.kcalTarget`
- `app/today/_lib/utils.ts` — `formatShortDate`
- `app/allenamento/_components/PRToast.tsx` — pattern toast di riferimento
- `app/stats/page.tsx` — shell di pagina da replicare per `/profilo/achievements`
- `app/today/_components/WorkoutCard.tsx` — punto di aggancio della condivisione
- `AGENTS.md` + `graph.json` — obblighi di consultazione prima di importare
