# Task — Sviluppatore 3: UI/UX Lead & Frontend Dev — Audit Accessibilità, Contrasto Colori e Leggibilità WCAG AA

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase `@supabase/ssr`, lucide-react).

Obiettivo: portare tutta l'interfaccia — con priorità assoluta al tema scuro — a conformità **WCAG 2.1 AA**: 4.5:1 per il testo normale, 3:1 per il testo grande (≥18.66px bold o ≥24px) e per i componenti non testuali (bordi di input, icone informative, indicatori di stato, focus ring).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `@import "tailwindcss";` come prima riga, **nessun `tailwind.config.ts` nel repo** | `app/globals.css:1` | Tailwind 4: la configurazione dei colori si fa **in CSS con `@theme`**, non in un file JS. Non creare `tailwind.config.ts` — introdurrebbe una seconda fonte di verità e romperebbe la pipeline v4. I token vanno dichiarati in `globals.css`. |
| Il dark theme è un **layer di override su classi chiare**, non un set di varianti `dark:` | `app/globals.css`, commento in testa: *"Per un vero dark mode a lungo termine sarebbe meglio migrare tutte le classi Tailwind con varianti dark:… Per ora usiamo un approccio pragmatico"* | ⚠️ **Origine di tutto il problema.** Gli override ridipingono gli **sfondi** (`.bg-white` → `#1a2620`, `.bg-[#FAF7F0]` → `#223129`, `.bg-emerald-50` → `rgba(6,78,59,.4)`) ma di testo ridipingono **una sola classe**: `.text-emerald-950` → `#ecfdf5`. Tutto il resto del testo resta del colore chiaro-tema su fondo scuro. |
| Selettore di tema: attributo `html[data-theme="dark"]` | `app/globals.css` (tutti i blocchi scuri) | I nuovi token devono agganciarsi **allo stesso selettore**. Non introdurre `prefers-color-scheme` né la variante `dark:` di Tailwind (che di default usa `.dark`, non `[data-theme]`): sarebbero due meccanismi in conflitto. |
| `html[data-theme="dark"] body { color: #13ff91; }` | `app/globals.css` | Verde neon fluo come **colore di testo ereditato di default**, in disaccordo con `#ecfdf5` usato per `.text-emerald-950`. Ogni testo che non ha una classe esplicita eredita il neon. Da sostituire con il token primario. |
| Superfici scure effettive: `#0f1a15` (pagina), `#1a2620` (card `.bg-white`), `#223129` (card interne `.bg-[#FAF7F0]` e input) | `app/globals.css` | Sono **queste** le tre superfici su cui va calcolato ogni rapporto, non `#0f172a`/`#061a14`. Ogni token va verificato sulla superficie **più chiara** (`#223129`), che è il caso peggiore. |
| Testi secondari scritti con **opacità sul colore**: `text-emerald-800/70`, `/60`, `/50`, `/40`, `/30`, `text-teal-800/70`, `text-teal-600/60`, `text-amber-800/50` | `SessionList.tsx`, `SessionEditor.tsx`, `ExerciseSetCard.tsx`, `WorkoutCard.tsx`, `NutritionCard.tsx`, `Header.tsx`, `ProfileForm.tsx`, `NotificationsSection.tsx`, `impostazioni/page.tsx`, `allenamento/page.tsx`, `PRToast.tsx` | ⚠️ **Anti-pattern da eliminare, non da correggere.** L'opacità mescola il testo con lo sfondo: lo stesso valore dà un rapporto diverso su ogni superficie e nessun override CSS può ripararlo, perché la classe che serve ridefinire (`.text-emerald-800\/60`) contiene già l'alpha. La sostituzione deve avvenire **nei componenti**, con classi token opache. |
| `{s.focus}` (il testo "Gambe" della card sessione) → `text-xs font-medium text-emerald-800/60` | `app/scheda/_components/SessionList.tsx` | **Caso segnalato dall'utente.** `#065f46` al 60% su `#1a2620` = `#0e4837` → **1.49:1**. Anche in tema chiaro, su bianco, è **3.01:1** → fallisce AA pure lì. Il difetto non è solo del dark theme. |
| Anteprima esercizi → `text-[11px] font-medium text-emerald-800/50` | `app/scheda/_components/SessionList.tsx` | **1.38:1** su dark, 2.44:1 su bianco. Testo a 11px: soglia richiesta 4.5:1. |
| Placeholder → `placeholder:text-emerald-800/30` | `app/scheda/_components/SessionEditor.tsx` (input nome, input focus, textarea note) | **1.20:1** su dark. `globals.css` ridipinge `background-color` e `color` di `input/textarea/select` ma **non tocca il placeholder**: resta emerald-800 al 30% su `#223129`. |
| Toggle segmentato "Semplice / Avanzata": selezionato `bg-white text-emerald-800`, non selezionato `text-emerald-800/50` | `app/allenamento/_components/ExerciseSetCard.tsx` | Doppio difetto in dark: il non-selezionato è **1.38:1**, e il selezionato diventa `#065f46` su `.bg-white` → `#1a2620` = **2.04:1**, quindi la pill attiva **non si distingue nemmeno dallo sfondo della card**: si perde l'indicazione di stato, che WCAG 1.4.11 richiede a 3:1. |
| Indici ripetizione `#1`, `#2`… → `text-[9px] font-bold text-emerald-800/40` | `app/allenamento/_components/ExerciseSetCard.tsx` | **1.29:1** a 9px. Il caso peggiore dell'app. |
| Label input → `text-[10px]/[11px] font-bold uppercase tracking-wide text-emerald-800/60-70` | `SessionEditor.tsx`, `ExerciseSetCard.tsx`, `ProfileForm.tsx`, `FoodPicker.tsx`, `NutritionCard.tsx` | 1.49–1.62:1. Sono **label di controlli di form**: falliscono 1.4.3 e rendono i campi non identificabili. |
| Badge/pill informative: `bg-teal-100 text-teal-700`, `bg-emerald-100 text-emerald-700`, `bg-amber-100 text-amber-700`, `bg-amber-50 text-amber-700`, `bg-red-50 text-red-900` | `WorkoutCard.tsx`, `Header.tsx`, `PRToast.tsx`, `SessionList.tsx` | Nessuno di questi fondi chiari è nella lista di override di `globals.css` (che copre solo `bg-white`, `bg-[#FAF7F0]`, `bg-emerald-50*`): in dark restano **fondi chiari con testo chiaro attorno**, isole luminose che spezzano il tema e, dove il fondo resta chiaro e il testo viene ereditato, diventano illeggibili. |
| `disabled:opacity-40` sul bottone primario, `disabled:opacity-50` sulle azioni secondarie | `SessionEditor.tsx`, `NotificationsSection.tsx`, `ExerciseSetCard.tsx` (bottone "Copia") | L'opacità sul contenitore abbassa **anche** il contrasto del testo bianco su `bg-emerald-600`. WCAG 2.1 esenta i controlli disabilitati, ma la leggibilità reale a 0.4 è nulla: va portata a uno stato disabilitato **esplicito** e non a un'opacità cieca. |
| `focus:ring-2 focus:ring-emerald-300` / `focus:ring-amber-300` | tutti gli input | `#6ee7b7` su `#223129` = 8.95:1 → **conforme**. È l'unica cosa già corretta: **non toccarla**, va solo estesa ai bottoni, che oggi non hanno alcun `focus-visible`. |
| `text-emerald-950` è **l'unica** classe di testo con override dark (`#ecfdf5`, 14.85:1) | `app/globals.css` | È la prova che l'approccio funziona ma è stato applicato a una sola classe. La strategia corretta non è aggiungere 12 override di classi con alpha (impossibile), ma introdurre **token semantici** e migrare i componenti. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Ogni prompt include l'obbligo di leggere `node_modules/next/dist/docs/` prima di toccare config o convenzioni di file. |

### Mappatura dei rapporti attuali (calcolati, formula WCAG 2.x relative luminance)

Superficie di riferimento: card `.bg-white` in dark = **`#1a2620`**.

| Classe attuale | Colore risultante | Rapporto | Soglia | Esito |
|---|---|---|---|---|
| `text-emerald-800` (100%) | `#065f46` | **2.04:1** | 4.5 | ✗ |
| `text-emerald-800/70` | `#0c4e3b` | **1.62:1** | 4.5 | ✗ |
| `text-emerald-800/60` ← *"Gambe"* | `#0e4837` | **1.49:1** | 4.5 | ✗ |
| `text-emerald-800/50` | `#104233` | **1.38:1** | 4.5 | ✗ |
| `text-emerald-800/40` | `#123d2f` | **1.29:1** | 4.5 | ✗ |
| `text-emerald-800/30` ← *placeholder* | `#14372b` | **1.20:1** | 4.5 | ✗ |
| `text-teal-700` (100%) | `#0f766e` | **2.86:1** | 4.5 | ✗ |
| `text-teal-700/60` | `#13564f` | **1.84:1** | 4.5 | ✗ |
| `text-amber-700` (100%) | `#b45309` | **3.12:1** | 4.5 | ✗ (ok solo come icona ≥3:1) |
| `text-red-600` (100%) | `#dc2626` | **3.24:1** | 4.5 | ✗ (ok solo come icona) |
| `text-emerald-950` → override | `#ecfdf5` | **14.85:1** | 4.5 | ✓ |
| `focus:ring-emerald-300` | `#6ee7b7` | **10.27:1** | 3.0 | ✓ |

E in **tema chiaro**, su `#FFFFFF`, lo stesso anti-pattern fallisce comunque:

| Classe | Rapporto su bianco | Esito |
|---|---|---|
| `text-emerald-800/70` | 3.76:1 | ✗ (ok solo per testo grande) |
| `text-emerald-800/60` | 3.01:1 | ✗ |
| `text-emerald-800/50` | 2.44:1 | ✗ |
| `text-teal-700/60` | 2.56:1 | ✗ |
| `text-amber-700/60` | 2.49:1 | ✗ |

**Conclusione da portare in review:** non è un bug del dark theme. È un bug del design system, che il dark theme si limita ad amplificare da 3:1 a 1.5:1.

### File target

| File | Cosa cambia |
|---|---|
| `app/globals.css` | Layer di token semantici (`@theme` + variabili su `:root` e `html[data-theme="dark"]`), rimozione del `color: #13ff91`, override per placeholder / pill / stati disabilitati. |
| `app/scheda/page.tsx` | Sottotitolo di pagina `text-emerald-800/60` → token. |
| `app/scheda/_components/SessionList.tsx` | `{s.focus}` (*"Gambe"*), anteprima esercizi, empty state, header di sezione, pannello di conferma rosso. |
| `app/scheda/_components/SessionEditor.tsx` | Label dei campi, **placeholder** dei 3 input/textarea, pill "Nota", bottone salva `disabled:`. |
| `app/allenamento/_components/ExerciseSetCard.tsx` | Toggle segmentato Semplice/Avanzata (stato selezionato + non selezionato), label peso, indici ripetizione `#n`, placeholder "Kg", bottone "Copia" disabilitato, bottone "Annulla ultimo set". |
| `tailwind.config.ts` | **Non esiste e non va creato.** Tailwind 4: la palette vive in `globals.css`. |

---

## Le 3 decisioni architetturali da rispettare

1. **Token semantici, non colori nominali — e mai più opacità sul testo.**
   La palette non si esprime più come "emerald-800 al 60%" ma come **ruolo**: `fg-primary`, `fg-secondary`, `fg-muted`, `fg-placeholder`, `fg-accent`, `fg-warning`, `fg-danger`, più le superfici `surface-base / surface / surface-raised / surface-accent` e i bordi `border-subtle / border-strong`. Ogni token ha **due valori opachi**, uno per tema, entrambi verificati sulla superficie peggiore. Il motivo è meccanico, non estetico: un colore con alpha ha un rapporto di contrasto **diverso su ogni sfondo**, quindi non è verificabile una volta per tutte e non è correggibile da un override CSS, perché l'alpha è già cotto nel nome della classe (`.text-emerald-800\/60`). Un token opaco si verifica una volta e vale ovunque. Regola operativa: **nessuna classe `text-*/NN` sopravvive nei 5 file target.** L'opacità resta ammessa solo su bordi e sfondi decorativi, mai sul testo.

2. **Il dark theme smette di essere un filtro e diventa una riassegnazione di variabili.**
   Non si aggiungono altri override del tipo `html[data-theme="dark"] .text-X { color: Y }`: quella lista non converge (ci sono già 12 classi diverse con alpha, e ogni nuovo componente ne aggiunge). Si dichiarano le variabili una volta su `:root`, si **riassegnano** su `html[data-theme="dark"]`, e i componenti usano sempre lo stesso nome di classe in entrambi i temi. Gli override di sfondo esistenti (`.bg-white`, `.bg-[#FAF7F0]`, `.bg-emerald-50`) **restano dove sono**: sono il ponte che tiene in piedi il resto dell'app finché la migrazione non copre tutti i file. Chi tocca `globals.css` non deve cancellarli, deve solo esprimerli con le nuove variabili di superficie, così che il valore `#1a2620` esista in **un solo posto**.

3. **Ogni valore esadecimale è deciso dal calcolo, non dall'occhio — e il calcolo resta nel repo.**
   I token sotto sono già stati verificati contro le tre superfici scure reali (`#0f1a15`, `#1a2620`, `#223129`) e le due chiare (`#FFFFFF`, `#FAF7F0`), prendendo sempre il caso peggiore. Perché la conformità non si perda al primo colore aggiunto a occhio, il micro-prompt 1 richiede uno script `scripts/contrast-check.mjs` eseguibile con `node`, che ricalcola tutte le coppie token/superficie e **esce con codice 1** se anche una sola scende sotto la soglia. È il test di regressione dell'accessibilità: senza, questo task va rifatto tra due sprint.

### Palette token — valori verificati

**Tema chiaro** (superfici `#FFFFFF` card / `#FAF7F0` pagina):

| Token | Hex | vs `#FFFFFF` | vs `#FAF7F0` | Uso |
|---|---|---|---|---|
| `--fg-primary` | `#022C22` | 15.15:1 | 14.16:1 | titoli, valori, testo corpo |
| `--fg-secondary` | `#0B5C48` | 7.96:1 | 7.44:1 | sottotitoli, label di form, focus sessione |
| `--fg-muted` | `#3D6B5C` | 6.08:1 | 5.68:1 | anteprime, testi di supporto, empty state |
| `--fg-placeholder` | `#4A6F62` | 5.61:1 | 5.25:1 | placeholder di input e textarea |
| `--fg-accent` | `#0F766E` | 5.47:1 | 5.12:1 | link, azioni testuali, icone informative |
| `--fg-warning` | `#96521A` | 5.97:1 | 5.58:1 | avvisi ambra |
| `--fg-danger` | `#B91C1C` | 6.47:1 | 6.05:1 | errori, eliminazione |

**Tema scuro** (superfici `#0f1a15` pagina / `#1a2620` card / `#223129` card interne e input):

| Token | Hex | vs `#0f1a15` | vs `#1a2620` | vs `#223129` (caso peggiore) | Uso |
|---|---|---|---|---|---|
| `--fg-primary` | `#ECFDF5` | 16.91:1 | 14.85:1 | **12.95:1** | titoli, valori, testo corpo |
| `--fg-secondary` | `#A7C7B8` | 9.76:1 | 8.57:1 | **7.47:1** | sottotitoli, label, `{s.focus}` ← *"Gambe"* |
| `--fg-muted` | `#8FB3A4` | 7.76:1 | 6.82:1 | **5.95:1** | anteprime, testi di supporto |
| `--fg-placeholder` | `#88A99A` | 6.95:1 | 6.10:1 | **5.32:1** | placeholder |
| `--fg-accent` | `#5EEAD4` | 12.04:1 | 10.58:1 | **9.22:1** | link, azioni, icone |
| `--fg-warning` | `#FCD34D` | 12.35:1 | 10.85:1 | **9.46:1** | avvisi ambra |
| `--fg-danger` | `#FCA5A5` | 9.39:1 | 8.24:1 | **7.19:1** | errori, eliminazione |

**Superfici e bordi:**

| Token | Chiaro | Scuro | Nota |
|---|---|---|---|
| `--surface-base` | `#FAF7F0` | `#0f1a15` | sfondo pagina — valore già in repo |
| `--surface` | `#FFFFFF` | `#1a2620` | card — valore già in repo |
| `--surface-raised` | `#FAF7F0` | `#223129` | card interne e input — valore già in repo |
| `--surface-accent` | `#ECFDF5` | `#0C3A2C` | pill e blocchi accentati |
| `--border-subtle` | `rgba(6,78,59,.10)` | `rgba(236,253,245,.10)` | decorativo, nessuna soglia |
| `--border-strong` | `#5C7A6D` (4.71:1 su bianco) | `#587F6F` (**3.49:1** su `#1a2620`) | bordi di input e indicatori di stato: soglia **3:1**, WCAG 1.4.11 |

**Stati compositi:**

| Stato | Chiaro | Scuro | Rapporto |
|---|---|---|---|
| Pill selezionata | `bg-#047857` + testo `#FFFFFF` | `bg-#34D399` + testo `#06281F` | 5.48:1 / **8.21:1** |
| Pill non selezionata | testo `--fg-secondary` su `--surface-raised` | idem | 7.44:1 / **7.47:1** |
| Badge informativo | testo `--fg-accent` su `--surface-accent` | testo `#5EEAD4` su `#0C3A2C` | ≥7:1 / **8.57:1** |
| Disabilitato | `opacity: 1` + `--fg-muted` su `--surface-raised` + `cursor-not-allowed` | idem | 5.68:1 / **5.95:1** |
| Focus ring | `ring-emerald-300` (`#6EE7B7`) | idem | **10.27:1** — già conforme, non toccare |

### Librerie da installare

**Nessuna.** Lo script di verifica è ~60 righe di JavaScript puro con `node` (nessun `npm i`). Non aggiungere `axe-core`, `pa11y`, `jest-axe` né plugin Tailwind: aumentano la superficie di build senza risolvere nulla che il calcolo diretto non risolva.

---

## MICRO-PROMPT 1 — Layer di token semantici in `globals.css` + script di verifica

Copia da qui:

```
Lavora sul repo fitness-app. Task: introdurre il layer di token colore semantici e lo script di verifica del contrasto. NON modificare nessun file .tsx in questo step: al termine l'app deve rendere ESATTAMENTE come adesso, in entrambi i temi. Questo step aggiunge capacità, non cambia aspetto.

Leggi prima app/globals.css per intero. È Tailwind 4 (`@import "tailwindcss";` in riga 1) e nel repo NON esiste tailwind.config.ts: non crearlo, la palette si dichiara in CSS con @theme. Leggi node_modules/next/dist/docs/ prima di toccare qualsiasi convenzione di file (vedi AGENTS.md).

1) In app/globals.css, subito dopo `@import "tailwindcss";`, aggiungi il blocco delle variabili
   di ruolo per il TEMA CHIARO su :root. Valori esatti, già verificati, non arrotondarli:

   :root {
     --surface-base:     #FAF7F0;
     --surface:          #FFFFFF;
     --surface-raised:   #FAF7F0;
     --surface-accent:   #ECFDF5;

     --fg-primary:       #022C22;   /* 15.15:1 su bianco */
     --fg-secondary:     #0B5C48;   /* 7.96:1 */
     --fg-muted:         #3D6B5C;   /* 6.08:1 */
     --fg-placeholder:   #4A6F62;   /* 5.61:1 */
     --fg-accent:        #0F766E;   /* 5.47:1 */
     --fg-warning:       #96521A;   /* 5.97:1 */
     --fg-danger:        #B91C1C;   /* 6.47:1 */

     --border-subtle:    rgba(6, 78, 59, 0.10);
     --border-strong:    #5C7A6D;   /* 4.71:1 — soglia non testuale 3:1 */

     --pill-on:          #047857;
     --pill-on-fg:       #FFFFFF;   /* 5.48:1 */
   }

2) Riassegna gli STESSI nomi su html[data-theme="dark"]. Non aggiungere nomi nuovi,
   non usare `dark:` di Tailwind (di default si aggancia a .dark, non a [data-theme]):

   html[data-theme="dark"] {
     --surface-base:     #0f1a15;
     --surface:          #1a2620;
     --surface-raised:   #223129;
     --surface-accent:   #0C3A2C;

     --fg-primary:       #ECFDF5;   /* 12.95:1 sul caso peggiore #223129 */
     --fg-secondary:     #A7C7B8;   /* 7.47:1 */
     --fg-muted:         #8FB3A4;   /* 5.95:1 */
     --fg-placeholder:   #88A99A;   /* 5.32:1 */
     --fg-accent:        #5EEAD4;   /* 9.22:1 */
     --fg-warning:       #FCD34D;   /* 9.46:1 */
     --fg-danger:        #FCA5A5;   /* 7.19:1 */

     --border-subtle:    rgba(236, 253, 245, 0.10);
     --border-strong:    #587F6F;   /* 3.49:1 su #1a2620 */

     --pill-on:          #34D399;
     --pill-on-fg:       #06281F;   /* 8.21:1 */
   }

3) Esponi i token a Tailwind 4 con @theme, così da poter scrivere text-fg-secondary,
   bg-surface-raised, border-border-strong nei componenti (step 2):

   @theme inline {
     --color-surface-base:   var(--surface-base);
     --color-surface:        var(--surface);
     --color-surface-raised: var(--surface-raised);
     --color-surface-accent: var(--surface-accent);
     --color-fg-primary:     var(--fg-primary);
     --color-fg-secondary:   var(--fg-secondary);
     --color-fg-muted:       var(--fg-muted);
     --color-fg-placeholder: var(--fg-placeholder);
     --color-fg-accent:      var(--fg-accent);
     --color-fg-warning:     var(--fg-warning);
     --color-fg-danger:      var(--fg-danger);
     --color-border-subtle:  var(--border-subtle);
     --color-border-strong:  var(--border-strong);
     --color-pill-on:        var(--pill-on);
     --color-pill-on-fg:     var(--pill-on-fg);
   }

   `@theme inline` è obbligatorio: senza `inline` Tailwind 4 congela il valore al build
   e il cambio di tema a runtime non funziona. Verifica il comportamento generando una
   classe di prova prima di proseguire.

4) Riscrivi i blocchi ESISTENTI usando le variabili, senza cambiarne il valore reso:
   - `html, body { background-color: var(--surface-base); color: var(--fg-primary); }`
   - ⚠️ ELIMINA `html[data-theme="dark"] body { color: #13ff91; }`. È un verde neon che
     ogni testo senza classe esplicita eredita; va sostituito dal token primario, che il
     punto precedente già applica. Questa è una modifica VISIBILE ed è voluta: annotala nel riepilogo.
   - `html[data-theme="dark"] { background-color: var(--surface-base); }`
   - `.bg-white` (override dark) → `background-color: var(--surface);`
   - `.bg-[#FAF7F0]` e `main.bg-[#FAF7F0]` (override dark) → `var(--surface-raised)` / `var(--surface-base)`
     rispettando quale dei due era prima: main → base, card interne → raised.
   - i tre selettori di bordo (`.border-emerald-900/10`, `/5`, `.border-teal-900/5`) → `var(--border-subtle)`
   - `input, textarea, select` (override dark) → `background-color: var(--surface-raised);
     color: var(--fg-primary); border-color: var(--border-subtle);`
   LASCIA IN PIEDI gli altri override esistenti (sidebar, BottomNav, .bg-emerald-50*, gradienti,
   .text-emerald-950): sono il ponte che tiene leggibile il resto dell'app finché la migrazione
   non copre tutti i file. Esprimili con le variabili dove il valore coincide, non cancellarli.

5) Aggiungi due regole globali nuove, valide in ENTRAMBI i temi (fuori dal blocco [data-theme]):

   input::placeholder, textarea::placeholder { color: var(--fg-placeholder); opacity: 1; }
   /* `opacity: 1` è obbligatorio: Firefox applica di default opacity .54 al placeholder,
      che riporterebbe il rapporto sotto soglia anche con il token corretto. */

   :where(button, a, [role="button"]):focus-visible {
     outline: 2px solid #6EE7B7;   /* 10.27:1 su dark, già usato dagli input come focus ring */
     outline-offset: 2px;
   }
   /* Oggi i bottoni dell'app non hanno alcuno stile di focus visibile (WCAG 2.4.7).
      `:where()` mantiene specificità 0, quindi nessuna regola esistente viene sovrascritta. */

6) Crea scripts/contrast-check.mjs — JavaScript puro, nessuna dipendenza, eseguibile con
   `node scripts/contrast-check.mjs`:
   - implementa la relative luminance WCAG 2.x (canale/255, soglia 0.03928, gamma 2.4)
     e il rapporto (L1+0.05)/(L2+0.05)
   - definisce le due palette (chiara e scura) e le rispettive superfici, hardcodate,
     come singola fonte di verità dei valori attesi
   - per ogni token di testo verifica il rapporto contro OGNI superficie del suo tema
     e prende il PEGGIORE; soglia 4.5 per fg-primary/secondary/muted/placeholder/accent/
     warning/danger, soglia 3.0 per border-strong e per le coppie pill-on/pill-on-fg
   - stampa una tabella allineata `TOKEN  SUPERFICIE  RATIO  SOGLIA  OK/FAIL`
   - `process.exit(1)` se anche una sola coppia fallisce
   - aggiungi in package.json lo script `"a11y:contrast": "node scripts/contrast-check.mjs"`.
     NON aggiungerlo a `build` né a `lint`: deve poter essere eseguito da solo.

7) Verifica prima di dichiarare finito:
   - `npm run a11y:contrast` → tutte le righe OK, exit code 0 (verifica con `echo $?`)
   - `npx tsc --noEmit && npm run lint` → zero errori
   - `npm run build` → deve passare
   - `npm run dev`: apri /today, /scheda, /allenamento e /impostazioni in tema CHIARO →
     nessuna differenza visibile rispetto a prima (nessun .tsx è stato toccato)
   - passa al tema SCURO da /impostazioni → l'unica differenza attesa è la sparizione del
     verde neon #13ff91 dai testi senza classe, sostituito da #ECFDF5. I testi con
     text-emerald-800/NN sono ANCORA illeggibili: è corretto, li sistema il micro-prompt 2.
   - DevTools → Elements → seleziona <html data-theme="dark"> → Computed → verifica che
     --fg-secondary valga #A7C7B8 e che, tolto l'attributo, torni #0B5C48
   - Incolla nel riepilogo l'output di `npm run a11y:contrast`.
```

---

## MICRO-PROMPT 2 — Migrazione dei 5 file target ai token

```
Lavora sul repo fitness-app. Task: eliminare ogni testo a basso contrasto dai file dell'interfaccia scheda/allenamento, sostituendo le classi con opacità con i token del micro-prompt 1. NON modificare globals.css in questo step (è già a posto) e non introdurre nuovi valori esadecimali: se un colore ti serve e non è un token, il token manca e va discusso, non inventato.

Prerequisito: il micro-prompt 1 è applicato e `npm run a11y:contrast` esce con 0.
Leggi prima app/globals.css per avere in mente i nomi dei token disponibili.

REGOLA UNICA E NON NEGOZIABILE:
al termine, `grep -rn "text-emerald-[0-9]*/[0-9]" app/scheda app/allenamento` e
`grep -rn "text-teal-[0-9]*/[0-9]\|text-amber-[0-9]*/[0-9]" app/scheda app/allenamento`
devono restituire ZERO righe. L'opacità resta ammessa solo su bordi e sfondi, mai sul testo.

Tabella di sostituzione (applicala meccanicamente, non a occhio):
  text-emerald-950                → text-fg-primary
  text-emerald-800/70  (label)    → text-fg-secondary
  text-emerald-800/70  (heading)  → text-fg-secondary
  text-emerald-800/60             → text-fg-secondary
  text-emerald-800/50             → text-fg-muted
  text-emerald-800/40             → text-fg-muted
  text-emerald-800/30 (placeholder) → RIMUOVI la classe: il placeholder è ora globale
  text-emerald-800   (100%)       → text-fg-secondary
  text-teal-700 / text-teal-800/70 / text-teal-600/60 → text-fg-accent
  text-amber-700 / text-amber-800/50 → text-fg-warning
  text-red-600 / text-red-900      → text-fg-danger

A) app/scheda/page.tsx
   - Il sottotitolo sotto l'H1 (`text-sm font-medium text-emerald-800/60`) → text-fg-secondary.
   - L'H1 e ogni titolo `text-emerald-950` → text-fg-primary.

B) app/scheda/_components/SessionList.tsx
   1. ⚠️ CASO SEGNALATO: la riga `{s.focus} · ~{s.estimatedMinutes} min`, oggi
      `text-xs font-medium text-emerald-800/60` (1.49:1 in dark, 3.01:1 in chiaro) → text-fg-secondary.
      È l'etichetta "Gambe" della card sessione: dopo la modifica deve stare a 7.47:1 nel caso peggiore.
   2. L'anteprima esercizi `text-[11px] font-medium text-emerald-800/50` → text-fg-muted.
   3. L'empty state "Nessuna sessione…" `text-sm text-emerald-800/50` → text-fg-muted.
   4. L'heading "Le mie sessioni (n)" `text-xs font-bold uppercase tracking-widest text-emerald-800/70`
      → text-fg-secondary; l'icona Dumbbell `text-teal-700` → text-fg-accent.
   5. Il nome sessione `text-sm font-bold text-emerald-950` → text-fg-primary.
   6. Pannello di conferma eliminazione: `bg-red-50` e `text-red-900` non hanno override dark
      (globals.css copre solo bg-white / bg-[#FAF7F0] / bg-emerald-50*): sostituisci con
      `bg-surface-raised border border-fg-danger/40` e testo `text-fg-danger`; il bottone
      "Annulla" passa da `text-emerald-800` a `text-fg-secondary`. Il bottone rosso pieno
      `bg-red-600 text-white` (4.83:1 di bianco su rosso) è conforme: NON toccarlo.
   7. I bottoni icona Pencil/Trash2 hanno `text-emerald-700` / `text-red-600` su `bg-white`:
      in dark diventano 2.0:1 e 3.2:1 su #1a2620. → text-fg-accent e text-fg-danger.
      Sono icone: la soglia è 3:1, ma i token le portano comunque sopra 7:1.
      Aggiungi/verifica `aria-label` su entrambi (già presenti: "Modifica", "Elimina") — non rimuoverli.

C) app/scheda/_components/SessionEditor.tsx
   1. Tutte le label `text-[11px] font-bold uppercase tracking-wide text-emerald-800/70` → text-fg-secondary.
   2. I 3 campi con `placeholder:text-emerald-800/30` (input nome sessione, input focus muscolare,
      textarea note): RIMUOVI la classe `placeholder:text-emerald-800/30`. Il colore arriva ora
      dalla regola globale `::placeholder { color: var(--fg-placeholder); opacity: 1; }`.
      NON sostituirla con `placeholder:text-fg-placeholder`: duplicherebbe la fonte di verità.
   3. `text-emerald-950` degli input → text-fg-primary; `bg-white` → bg-surface;
      `border-emerald-900/10` → border-border-subtle.
   4. Pill "Nota / + Nota": oggi `bg-amber-50 text-amber-700` o `bg-emerald-50 text-emerald-700`.
      → `bg-surface-accent text-fg-warning` e `bg-surface-accent text-fg-accent`.
   5. Bottone salva: sostituisci `disabled:opacity-40` con
      `disabled:bg-surface-raised disabled:text-fg-muted disabled:cursor-not-allowed`
      (opacità 1, contrasto 5.95:1 nel caso peggiore). Aggiungi `aria-disabled={!canSave}`
      accanto a `disabled={!canSave}`, senza rimuovere l'attributo nativo.
   6. NON toccare `focus:ring-2 focus:ring-emerald-300` / `focus:ring-amber-300`: 10.27:1, già conformi.

D) app/allenamento/_components/ExerciseSetCard.tsx
   1. ⚠️ TOGGLE SEGMENTATO "Semplice / Avanzata" — doppio difetto, è il punto più delicato del file:
      - stato NON selezionato: `text-emerald-800/50` (1.38:1) → `text-fg-secondary`
      - stato SELEZIONATO: oggi `bg-white text-emerald-800`. In dark `.bg-white` diventa #1a2620,
        cioè lo stesso colore della card: la pill attiva SPARISCE. Non è solo contrasto di testo,
        è la perdita dell'indicatore di stato (WCAG 1.4.11, soglia 3:1).
        → `bg-pill-on text-pill-on-fg shadow-sm` (8.21:1 in dark, 5.48:1 in chiaro).
      - aggiungi `aria-pressed={mode === "simple"}` / `aria-pressed={mode === "advanced"}`:
        lo stato non deve essere veicolato dal solo colore (WCAG 1.4.1).
   2. Label "Peso per N ripetizioni" e "Kg per ogni ripetizione"
      (`text-[10px] font-bold uppercase tracking-wide text-emerald-800/60`) → text-fg-secondary.
      Verifica che ogni <label> abbia `htmlFor` legato all'`id` del rispettivo input; se gli id
      non esistono, generali con useId() di React (già disponibile, React 19). Senza legame,
      la label corretta resta comunque non annunciata dallo screen reader.
   3. Indici ripetizione `#1`, `#2`… `text-[9px] font-bold uppercase text-emerald-800/40`
      (1.29:1, il peggiore dell'app) → text-fg-muted. A 9px la soglia resta 4.5:1: il token dà 5.95:1.
      Aggiungi `aria-hidden="true"` sullo <span> dell'indice e un `aria-label={`Peso ripetizione ${i+1}`}`
      sull'input corrispondente: il numero è decorativo, l'informazione deve stare sul controllo.
   4. Placeholder "Kg" / "kg" degli input numerici: nessuna classe placeholder è presente,
      quindi eredita già la regola globale. VERIFICA e non aggiungere nulla.
   5. Bottone "Copia": `disabled:opacity-40` → `disabled:text-fg-muted disabled:cursor-not-allowed`
      mantenendo `bg-surface-accent`. Aggiungi `aria-disabled={!repWeights[0]}`.
   6. Bottone "Annulla ultimo set": `text-emerald-800/60` → text-fg-muted;
      `bg-white/60` → `bg-surface`; `border-emerald-900/10` → border-border-subtle.
   7. Il bordo della card cambia in base a `isFullyDone`: verifica che lo stato "completato"
      non sia distinto SOLO dal colore del bordo. L'icona CheckCircle2 già presente basta:
      accertati che sia renderizzata nello stato completato e che abbia un `aria-label`
      (es. "Esercizio completato"); se non c'è, aggiungila.

E) app/globals.css — SOLO se dopo i punti sopra resta un caso non coperto:
   NON aggiungere override di classi con alpha. Se serve un colore che non è un token,
   fermati e riportalo nel riepilogo invece di inventare un esadecimale.

F) Verifica finale, obbligatoria prima di dichiarare il task chiuso:
   - `grep -rn "text-emerald-[0-9]*/[0-9]\|text-teal-[0-9]*/[0-9]\|text-amber-[0-9]*/[0-9]" app/scheda app/allenamento`
     → ZERO risultati. Incolla il comando e l'output vuoto nel riepilogo.
   - `grep -rn "opacity-40\|opacity-50" app/scheda app/allenamento` → nessuna occorrenza su testo
   - `npm run a11y:contrast` → tutte OK, exit 0
   - `npx tsc --noEmit && npm run lint` → zero errori
   - `npm run build` → deve passare
   - `npm run dev`, TEMA SCURO, con DevTools → Elements → pannello Accessibility → Contrast:
       1. /scheda → card sessione → l'etichetta "Gambe" (o il focus della tua sessione) misura
          ≥ 4.5:1 — Chrome deve mostrare la doppia spunta. Era 1.49:1.
       2. /scheda → l'anteprima esercizi (11px) misura ≥ 4.5:1
       3. /scheda → Modifica sessione → i placeholder "Es. Push — Petto, Spalle, Tricipiti" e
          "Es. Attento alla spalla destra…" sono leggibili e misurano ≥ 4.5:1. Era 1.20:1.
       4. /scheda → Modifica sessione con nome vuoto → il bottone disabilitato è leggibile,
          non un fantasma al 40%
       5. /allenamento → il toggle Semplice/Avanzata: la pill SELEZIONATA è chiaramente distinta
          dalla card (≥3:1) e il suo testo è ≥4.5:1; quella non selezionata è leggibile
       6. /allenamento → modalità Avanzata → gli indici #1…#n sono leggibili (≥4.5:1). Era 1.29:1.
       7. Tab da tastiera su tutta /scheda: ogni bottone e ogni link mostra un focus ring visibile
          (prima i bottoni non ne avevano nessuno)
   - Ripeti i punti 1, 3 e 5 in TEMA CHIARO: "Gambe" deve passare da 3.01:1 a 7.44:1 —
     il difetto non era solo del dark theme e la correzione deve valere in entrambi.
   - Riporta l'esito dei 7 punti + i 3 controlli in tema chiaro nel riepilogo.
```

---

## Note di attenzione da tenere d'occhio in review

- **`@theme` senza `inline` rompe il cambio di tema a runtime.** In Tailwind 4 `@theme { --color-x: var(--y) }` risolve `var(--y)` al momento del build e congela il valore: il tema scuro non cambierebbe più nulla. Serve `@theme inline`. Se in review vedi il tema che non commuta più, è quasi certamente questo.
- **`opacity: 1` sul placeholder non è ridondante.** Firefox applica di default `opacity: .54` a `::placeholder`: senza quella riga il token `#88A99A` scenderebbe a ~3.4:1 solo su Firefox, e il difetto sarebbe invisibile testando su Chrome.
- **La migrazione copre 5 file su ~30.** `WorkoutCard.tsx`, `NutritionCard.tsx`, `Header.tsx`, `ProfileForm.tsx`, `GoalsForm.tsx`, `FoodPicker.tsx`, `NotificationsSection.tsx`, `PRToast.tsx` e le pagine `/impostazioni`, `/profilo`, `/nutrition`, `/stats` usano lo stesso anti-pattern e **restano non conformi** dopo questo task. È una scelta di scope, non una svista: i token ci sono, la sostituzione è meccanica, ed è il task successivo naturale. Va scritto nel riepilogo, altrimenti l'app risulterà "sistemata" quando è sistemata a metà.
- **Le pill con fondo chiaro sono la prossima bomba.** `bg-teal-100`, `bg-emerald-100`, `bg-amber-100`, `bg-amber-50`, `bg-red-50` non sono nella lista di override di `globals.css`: in tema scuro restano fondi chiari. Finché il testo interno resta scuro sono leggibili per caso, ma appena qualcuno applica un token chiaro a quel testo il badge diventa illeggibile. Chi tocca `WorkoutCard.tsx` o `PRToast.tsx` deve migrare **fondo e testo insieme**, mai solo uno dei due.
- **`text-emerald-800` al 100% è già sotto soglia in dark (2.04:1).** Non basta togliere le opacità: anche le occorrenze piene vanno sostituite. Un grep che cerca solo `/NN` lascia passare metà del problema — per questo la verifica del micro-prompt 2 ne prevede due.
- **Il rapporto si calcola sulla superficie, non sulla pagina.** `#223129` (card interne e input) è più chiara di `#1a2620` (card) che è più chiara di `#0f1a15` (pagina): ogni token è stato validato sul caso peggiore, `#223129`. Se in futuro nasce una superficie ancora più chiara, va aggiunta a `contrast-check.mjs` **prima** di essere usata, non dopo.
- **Contrasto ≠ accessibilità.** Questo task chiude 1.4.3 (contrasto minimo), 1.4.11 (contrasto non testuale) e apre 2.4.7 (focus visibile). Restano scoperti: la navigazione da tastiera dentro i `<Modal>` (focus trap ed `Escape`), gli annunci `aria-live` sui salvataggi ottimistici, e l'ordine dei landmark. Non aggiungerli qui — vanno in una scheda dedicata, o questo task non chiude più.
- **Nessun `tailwind.config.ts`.** Se lo vedi comparire in diff, è un errore: reintrodurrebbe una seconda fonte di verità per i colori e, in Tailwind 4, verrebbe in gran parte ignorato — il peggiore dei due mondi.

## Riferimenti nel repo

- `app/globals.css` — `@import "tailwindcss"` (v4), override `html[data-theme="dark"]`, `body { color: #13ff91 }`, superfici `#0f1a15` / `#1a2620` / `#223129`, unico override di testo `.text-emerald-950` → `#ecfdf5`
- `app/scheda/page.tsx` — sottotitolo `text-emerald-800/60`
- `app/scheda/_components/SessionList.tsx` — `{s.focus}` (*"Gambe"*, `/60`), anteprima esercizi (`/50`), empty state, conferma inline `bg-red-50` / `text-red-900`
- `app/scheda/_components/SessionEditor.tsx` — label `/70`, `placeholder:text-emerald-800/30` ×3, pill Nota, `disabled:opacity-40`
- `app/allenamento/_components/ExerciseSetCard.tsx` — toggle `bg-white text-emerald-800` / `text-emerald-800/50`, label `/60`, indici `/40`, `disabled:opacity-40`
- `app/impostazioni/page.tsx`, `app/allenamento/page.tsx`, `app/today/_components/WorkoutCard.tsx`, `NutritionCard.tsx`, `Header.tsx`, `PRToast.tsx`, `app/profilo/_components/ProfileForm.tsx`, `app/nutrition/_components/FoodPicker.tsx` — stesso anti-pattern, **fuori scope di questo task**
- `AGENTS.md` — obbligo di consultare `node_modules/next/dist/docs/`
