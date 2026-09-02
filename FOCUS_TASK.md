# Task — Designer 3: Modalità "Focus" Allenamento (UX/UI)

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase, lucide-react, recharts).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `SessionTimer` esporta **default** il componente **e la funzione `formatTime`**, importata da `RestTimer` | `app/allenamento/_components/SessionTimer.tsx` | `formatTime` è un'API pubblica di fatto: non spostarla, non rinominarla, non cambiarne la firma. |
| `SessionTimer` tiene `seconds` in stato **interno** e notifica il padre solo via `onTick` (con `onTickRef` + `useEffect`, fix documentato nel file contro "Cannot update a component while rendering") | `SessionTimer.tsx` | La vista Focus **non può essere un secondo componente montato accanto**: sarebbe un secondo cronometro con un secondo stato. Il Focus va renderizzato **dallo stesso componente**, come ramo alternativo dello stesso `seconds`. |
| `SessionTimer` incrementa `seconds` con `setInterval(1000)` accumulativo | `SessionTimer.tsx` | ⚠️ `setInterval` viene **throttlato a ~1 tick/minuto** in tab background e a schermo spento. Con lo schermo del telefono che si spegne in palestra, la durata sessione salvata su Supabase **è sottostimata**. Va risolto con un riferimento temporale assoluto. |
| `RestTimer` ricalcola l'interval a ogni secondo (`useEffect` con deps `[active, remaining, onEnd]`) e `onEnd` arriva da `page.tsx` come **arrow inline** (identità nuova a ogni render) | `RestTimer.tsx`, `app/allenamento/page.tsx` | Stesso problema di drift, amplificato: il countdown di recupero è **la funzione che deve suonare puntuale**. Passare a scadenza assoluta (`endAt`) è un requisito, non un'ottimizzazione. |
| `RestTimer` è un overlay `fixed inset-x-4 bottom-20 z-40 … md:bottom-6 md:left-64` | `RestTimer.tsx` | Le coordinate tengono già conto di **BottomNav (mobile) e sidebar (desktop)**. Il Focus deve stare **sopra** entrambi: serve uno z-index > 50 (`Modal` è `z-50`). |
| `playBeep()` (Web Audio API, nessun file audio) + `export { PRESETS as REST_PRESETS }` | `RestTimer.tsx` | Il beep esiste già e funziona senza asset: **riusarlo**, non reintrodurre un `<audio>`. I preset 60/90/120/180 sono l'API verso `RestPresetPicker`. |
| `Modal` chiude **al click sullo sfondo** e non ha focus trap né `role="dialog"` | `app/today/_components/Modal.tsx` | ⚠️ Il Focus **non deve usare `Modal`**: un tocco fuori bersaglio con le mani sudate chiuderebbe la modalità a metà serie. Serve un contenitore dedicato senza chiusura per click esterno. |
| `Modal` è largo `max-w-md` fisso, `ExercisePicker` ha la lista in `max-h-72 overflow-y-auto` | `Modal.tsx`, `app/scheda/_components/ExercisePicker.tsx` | Uno slot media (video/Lottie) **non ci sta** in 288px di altezza a `max-w-md`. Serve una prop `size` opzionale su `Modal`, retrocompatibile. |
| `ExerciseDefinition` **non ha nessun campo media** (solo `id`, `name`, `primaryMuscle`, `equipment`, …) | `app/today/_lib/types.ts`, `exerciseData.ts` | Il campo va aggiunto **opzionale**: `exerciseData.ts` (decine di record) non va toccato e continua a compilare. |
| Dark mode implementato in `globals.css` come **override di classi Tailwind letterali** (`html[data-theme="dark"] .bg-white { … }`, `.bg-emerald-50`, `.text-emerald-950`, `.border-emerald-900\/10`, …) | `app/globals.css` | ⚠️ **Vincolo più insidioso del task.** Se il Focus usa `bg-white` o `text-emerald-950`, il tema scuro glielo riscrive sotto. Il Focus deve usare **colori espliciti in classi arbitrarie** (`bg-[#04140D]`), così è identico nei due temi — che è esattamente ciò che si vuole da una modalità ad altissimo contrasto. |
| **Nessun Wake Lock in tutto il repo.** `NotificationsSection` documenta esplicitamente: nessun Service Worker, le notifiche funzionano solo ad app aperta | `app/impostazioni/_components/NotificationsSection.tsx` | Lo schermo si spegne durante il recupero. Il Wake Lock va scritto da zero, come hook isolato e **best-effort** (API non universale). |
| Nessuna `tailwind.config.*` con palette custom: si usano i colori stock Tailwind + `#FAF7F0` (sfondo panna) in classe arbitraria | tutto il repo | La "palette esistente" è: `emerald-*` / `teal-*` (azione) / `amber-*` (attenzione) / `red-*` (distruttivo) / `#FAF7F0`. Il Focus ne è la **declinazione notturna**, non una palette nuova. |
| `/allenamento/page.tsx` possiede `restActive`, `restDefault`, `durationSec` e li passa ai due timer | `app/allenamento/page.tsx` | Lo stato resta lì: il Focus **non introduce nuovo stato nel padre**. Nessuna modifica alla firma di `startSession`/`addSet`/`finishSession`. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Ogni prompt include l'obbligo di leggere `node_modules/next/dist/docs/` prima di toccare config, route o metadata (viewport). |

### Le 6 decisioni architetturali da rispettare

1. **Il Focus è un ramo di rendering, non un componente parallelo.** `SessionTimer` e `RestTimer` restano l'unica fonte di verità del loro tempo: aggiungono uno stato locale `focus: boolean` e renderizzano *o* la card attuale *o* l'overlay. Montare un `<SessionTimerFocus>` accanto significherebbe due `setInterval`, due valori di `seconds` e un `onTick` che rimbalza — regressione garantita sulla durata salvata.

2. **"Fullscreen" è CSS, non Fullscreen API.** iOS Safari non supporta `requestFullscreen()` su elementi non-video: costruire la feature sull'API significherebbe non averla sul dispositivo che la userà di più. Il Focus è `fixed inset-0 z-[60]` con `h-[100dvh]` (non `100vh`: la barra URL mobile falserebbe l'altezza) e padding `env(safe-area-inset-*)`. La Fullscreen API si può chiamare in `try/catch` come **miglioria opzionale su desktop**, mai come prerequisito.

3. **Tempo per scadenza assoluta, non per accumulo di tick.** Entrambi i timer smettono di fare `seconds + 1` / `remaining - 1` e passano a `Date.now()` come riferimento (`startedAt` per il cronometro, `endAt` per il countdown). L'`setInterval` diventa solo un *repaint* a 250–1000 ms, e un listener su `visibilitychange` risincronizza al rientro. È la stessa correzione che rende affidabile il beep e la `durationSeconds` scritta su `workout_logs`.

4. **Wake Lock best-effort, con rilascio garantito.** `navigator.wakeLock` è dietro `if ("wakeLock" in navigator)`, in `try/catch`, e va **riacquisito** su `visibilitychange` (il browser lo rilascia da solo quando la tab perde il focus). Rilascio obbligatorio all'uscita dal Focus e nel cleanup dell'effetto: uno schermo lasciato acceso a fine allenamento è un bug che l'utente paga in batteria. Se l'API manca, la UI non mostra errori: mostra solo che l'indicatore "schermo attivo" non c'è.

5. **Nessuna azione distruttiva raggiungibile con un tocco solo.** In palestra, sotto sforzo, con una mano: touch target minimi **64×64 px** (il resto dell'app sta a 32–40), azioni positive (Pausa, +15s, OK) nella *thumb zone* in basso, azioni distruttive (Esci dal Focus, Reset, Annulla recupero) in alto e **a due step**: `press-and-hold 600 ms` con anello di progresso, oppure conferma esplicita. Zero chiusura per click sullo sfondo, zero `onClick` sul contenitore.

6. **Retrocompatibilità totale via props opzionali.** Ogni nuova prop di `SessionTimer`, `RestTimer`, `Modal` ed `ExercisePicker` ha un default che riproduce **esattamente** il comportamento di oggi. Il criterio di collaudo di ogni prompt include "senza attivare il Focus, la pagina è pixel-identica a prima".

### Librerie da installare

**Nessuna.** Le icone servono e sono già in `lucide-react`: `Maximize2`, `Minimize2`, `X`, `Play`, `Pause`, `Check`, `Plus`, `Timer`, `Lock`, `Sun`. `lottie-react` **non va installato in questo task**: lo slot media espone un contratto che accetta anche `kind: "lottie"`, ma la resa è un placeholder finché non ci saranno asset reali. Aggiungere una dipendenza da ~250 kB per renderizzare una scatola vuota è debito, non preparazione.

---

## MICRO-PROMPT 1 — Primitive: `useWakeLock`, `useDeadline`, `FocusShell`

Copia da qui:

```
Lavora sul repo fitness-app. Task: primitive per la modalità Focus dell'allenamento. In questo step NON modificare SessionTimer.tsx, NON modificare RestTimer.tsx, NON modificare app/allenamento/page.tsx. Crei solo file nuovi, non montati da nessuna parte: è corretto che a fine step la UI sia invariata.

Leggi prima:
 - app/allenamento/_components/SessionTimer.tsx  (formatTime, pattern onTickRef)
 - app/allenamento/_components/RestTimer.tsx     (playBeep, PRESETS)
 - app/globals.css                               (IMPORTANTE: il dark mode riscrive classi Tailwind letterali come .bg-white e .text-emerald-950)

A) Crea app/allenamento/_lib/useWakeLock.ts ("use client")

   export function useWakeLock(enabled: boolean): { supported: boolean; active: boolean }

   - supported = typeof navigator !== "undefined" && "wakeLock" in navigator  (calcolalo in useEffect, non in render: SSR)
   - quando enabled passa a true: await navigator.wakeLock.request("screen") dentro try/catch, salva la sentinel in un useRef
   - listener su document "visibilitychange": se document.visibilityState === "visible" && enabled && sentinel rilasciata → riacquisisci
   - listener "release" sulla sentinel → active = false
   - quando enabled torna false, e nel cleanup dell'effetto: sentinel.release() in try/catch, ref a null
   - nessun throw, nessun console.error rumoroso, nessun alert: se l'API manca o il browser rifiuta, supported/active restano false e basta
   - tipizza senza `any`: usa `WakeLockSentinel` (è in lib.dom.d.ts) e restringi con "wakeLock" in navigator

B) Crea app/allenamento/_lib/useDeadline.ts ("use client")

   Due hook, entrambi basati su Date.now() e non sull'accumulo di tick (setInterval viene throttlato a ~1/minuto in background: oggi la durata sessione salvata è sottostimata).

   export function useElapsed(running: boolean, initialSeconds = 0): { seconds: number; reset: () => void }
     - tiene in ref: baseSeconds (secondi congelati alle pause) e startedAt (timestamp dell'ultimo start, null se in pausa)
     - seconds = baseSeconds + (startedAt ? Math.floor((Date.now() - startedAt)/1000) : 0)
     - un setInterval(1000) fa SOLO da repaint (setState di un contatore o del valore calcolato), non incrementa niente
     - risincronizza su "visibilitychange" quando la tab torna visibile
     - reset() azzera base e riparte da adesso se running

   export function useCountdown(endAt: number | null, onEnd: () => void): { remaining: number }
     - remaining = endAt === null ? 0 : Math.max(0, Math.ceil((endAt - Date.now())/1000))
     - onEnd va chiamato UNA volta sola quando si raggiunge lo zero: usa un ref onEndRef aggiornato in useEffect (stesso pattern di onTickRef in SessionTimer.tsx) + un ref firedFor: number|null che memorizza l'endAt già "sparato". È il punto critico: oggi RestTimer ha onEnd nelle deps di un effetto che ricrea l'interval ogni secondo, e page.tsx gli passa una arrow inline.
     - repaint ogni 250 ms mentre remaining > 0 (per una barra fluida), interval fermo a zero
     - risincronizza su "visibilitychange": se al rientro il tempo è scaduto, chiama onEnd subito

C) Crea app/allenamento/_components/FocusShell.tsx ("use client")

   Contenitore riusabile della modalità Focus. NON usare Modal: Modal chiude al click sullo sfondo e in palestra chiuderebbe a metà serie.

   interface FocusShellProps {
     open: boolean;
     label: string;                 // es. "Durata sessione", "Recupero"
     onExit: () => void;            // uscita dal Focus (NON annullamento della sessione)
     accent?: "teal" | "amber";     // default "teal"
     wakeLockActive?: boolean;      // mostra l'indicatore schermo attivo
     children: React.ReactNode;     // il tempo + i controlli, forniti dal chiamante
   }

   Requisiti:
   - if (!open) return null
   - contenitore: fixed inset-0 z-[60] flex flex-col bg-[#04140D] text-white
     con style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
     e min-h-[100dvh] (NON 100vh: su mobile la barra URL falsa l'altezza)
   - COLORI: usa SOLO classi arbitrarie esplicite (bg-[#04140D], text-white, text-[#7FE7C4], border-white/15).
     NON usare bg-white, bg-emerald-50, text-emerald-950, border-emerald-900/10: globals.css le riscrive in dark mode e il Focus cambierebbe aspetto tra i due temi. Il Focus è volutamente identico in entrambi.
   - nessun onClick sul contenitore, nessuna chiusura per click esterno, nessuna chiusura con ESC accidentale (ESC è ammesso solo da tastiera desktop: va bene chiamarlo, ma su touch non esiste)
   - in alto: label in text-xs font-bold uppercase tracking-[0.2em] text-white/50, e a destra il bottone di uscita
   - USCITA A DUE STEP (anti-tocco accidentale): il bottone di uscita (icona Minimize2, area 64x64 minimo) si attiva con press-and-hold di 600 ms.
     Implementazione: onPointerDown avvia un setTimeout(600) e un'animazione dell'anello; onPointerUp/onPointerCancel/onPointerLeave lo annulla.
     Mostra il progresso con un cerchio SVG (stroke-dasharray animato) oppure una scale/opacity crescente; sotto, testo "Tieni premuto" in text-[10px] text-white/40.
     Aggiungi aria-label="Tieni premuto per uscire dalla modalità Focus".
   - se wakeLockActive: una pill in alto a sinistra con icona Sun (h-3 w-3) e testo "Schermo attivo", bg-white/10 text-white/60 rounded-full px-2 py-0.5 text-[10px]
   - body scroll lock finché open: useEffect che salva document.body.style.overflow, lo mette a "hidden", lo ripristina nel cleanup
   - children in un <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">

D) Crea app/allenamento/_components/FocusButton.tsx ("use client")

   Bottone gigante riusabile per i controlli dentro il Focus. È il pezzo che rende la modalità usabile con una mano sotto sforzo.

   interface FocusButtonProps {
     onClick: () => void;
     icon: React.ReactNode;
     label: string;
     variant?: "primary" | "ghost" | "danger";   // default "primary"
     holdToConfirm?: boolean;                    // default false; se true richiede press-and-hold 600ms
     className?: string;
   }

   - dimensione minima 64x64 (min-h-16 min-w-16), padding generoso, rounded-3xl
   - primary: bg-[#12D6A0] text-[#04140D]; ghost: border border-white/20 text-white bg-white/5; danger: border border-[#FF6B6B]/40 text-[#FF6B6B] bg-[#FF6B6B]/10
   - label sempre visibile sotto l'icona, text-[11px] font-bold uppercase tracking-wide (niente icone mute: sotto sforzo non si decodificano)
   - active:scale-95 transition, type="button", touch-manipulation, select-none
   - holdToConfirm riusa la stessa logica di FocusShell: estrai la logica press-and-hold in un hook locale condiviso app/allenamento/_lib/useHoldToConfirm.ts (onHoldStart/onHoldEnd/progress 0-1) e usalo in entrambi. Non duplicare i timer.

E) Verifica:
   - npx tsc --noEmit && npm run lint  → zero errori
   - nessun test manuale: i componenti non sono ancora montati. Conferma con `git status` che hai toccato SOLO file nuovi sotto app/allenamento/_lib e app/allenamento/_components.
```

---

## MICRO-PROMPT 2 — Focus su `SessionTimer` e `RestTimer`

```
Lavora sul repo fitness-app. Task: attivare la modalità Focus sui due timer. Vincolo assoluto di retrocompatibilità: senza entrare in Focus, /allenamento deve restare identica a prima, e le firme delle props di SessionTimer e RestTimer non cambiano (le nuove sono tutte opzionali con default).

Usa le primitive del passo precedente: useWakeLock, useElapsed, useCountdown, FocusShell, FocusButton.

A) app/allenamento/_components/SessionTimer.tsx

  1. NON creare un componente separato per il Focus: seconds vive qui, un secondo componente sarebbe un secondo cronometro. Aggiungi uno stato locale: const [focus, setFocus] = useState(false).

  2. Sostituisci il setInterval accumulativo con useElapsed(running):
       const { seconds, reset } = useElapsed(running);
     Elimina lo useState(0) di seconds e il suo interval. MANTIENI intatto il blocco onTickRef + useEffect([seconds]) che notifica il padre: è il fix documentato nel file contro "Cannot update a component while rendering", non toccarlo.
     handleReset ora chiama reset() invece di setSeconds(0).
     ⚠️ Questo corregge anche un bug esistente: con lo schermo spento setInterval viene throttlato e durationSeconds salvata su workout_logs risulta sottostimata.

  3. formatTime resta esportata da questo file con la stessa firma: RestTimer la importa.

  4. Nella card attuale, accanto ai tre bottoni, aggiungi un quarto controllo compatto (icona Maximize2, aria-label "Modalità Focus") che fa setFocus(true). Stile coerente con i bottoni esistenti: rounded-xl, border border-emerald-900/10, bg-white, text-emerald-800. Nessun'altra modifica visiva alla card.

  5. Ramo Focus, renderizzato in aggiunta alla card (la card resta montata sotto l'overlay, così non si smonta nulla):
       const { supported, active: wakeActive } = useWakeLock(focus);
       <FocusShell open={focus} label="Durata sessione" onExit={() => setFocus(false)} wakeLockActive={wakeActive}>
     Contenuto:
       - il tempo: <p className="font-mono tabular-nums font-bold leading-none text-[clamp(4rem,22vw,9rem)]">{formatTime(seconds)}</p>
       - sotto, lo stato: "In corso" / "In pausa" in text-sm uppercase tracking-[0.2em] text-white/40
       - una riga di FocusButton: Pausa/Riprendi (primary, icona Pause/Play), Stop (ghost, icona Square, holdToConfirm), Reset (danger, icona RotateCcw, holdToConfirm)
       - Stop e Reset chiamano gli stessi handler già presenti (handleStop, handleReset). Il flag showResetConfirm della card NON serve nel Focus: lì la conferma è il press-and-hold.

B) app/allenamento/_components/RestTimer.tsx

  1. Props invariate (active, onCancel, onEnd, onExtend). Aggiungi solo: focusByDefault?: boolean (default false).

  2. Sostituisci il countdown con la scadenza assoluta:
       const [endAt, setEndAt] = useState<number | null>(null);
       useEffect(() => { setEndAt(active === null ? null : Date.now() + active * 1000); }, [active]);
       const { remaining } = useCountdown(endAt, handleEnd);
     handleEnd = () => { playBeep(); vibrate(); onEnd(); }  — playBeep resta la funzione già presente in fondo al file, non riscriverla.
     onExtend continua a essere chiamato verso il padre COME OGGI (il padre alza `active`), quindi l'effetto ricalcola endAt: non gestire l'estensione con due sorgenti di verità.
     ⚠️ Elimina l'effetto con deps [active, remaining, onEnd]: ricreava l'interval a ogni secondo e page.tsx passa una arrow inline come onEnd.

  3. Aggiungi vibrate(): if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([200, 100, 200]); dentro try/catch. Best-effort, silenziosa se non supportata.

  4. progress si calcola su `active` e `remaining` come oggi. Nella pill compatta aggiungi l'icona Maximize2 per entrare in Focus; se focusByDefault è true, il Focus si apre da solo quando active passa da null a un numero.

  5. Ramo Focus (accent="amber"): countdown gigante con lo stesso clamp del punto A, un anello di progresso SVG (cerchio r=120, stroke-width 8, stroke-dasharray/offset legati a progress, stroke #FFB020, traccia bianca al 10%), e sotto:
       - FocusButton "+15s" (primary, icona Plus) → onExtend?.(15)
       - FocusButton "Salta" (ghost, icona SkipForward) → chiude il Focus e chiama onEnd()
       - l'uscita dal Focus (press-and-hold di FocusShell) NON annulla il recupero: torna solo alla pill. L'annullamento resta l'unica X della pill compatta. Sono due azioni diverse e devono restare distinguibili.
       - negli ultimi 5 secondi: il numero passa a text-[#FFB020] con una animate-pulse. Nient'altro che lampeggi.

C) app/allenamento/page.tsx — modifica minima
   Passa <RestTimer ... focusByDefault /> solo se vuoi il comportamento automatico; in caso di dubbio lasciala fuori e verifica prima manualmente. NON aggiungere stato nuovo alla pagina, NON toccare handleCompleteSet, handleFinish, startSession.

D) Verifica:
   - npx tsc --noEmit && npm run lint  → zero errori
   - npm run build deve passare
   - Collaudo visivo, in quest'ordine:
       1. /allenamento senza entrare in Focus → confronto con la versione precedente: card timer, pill recupero, spaziature identiche (regressione zero)
       2. entra in Focus dal cronometro → l'overlay copre BottomNav (mobile) e sidebar (desktop); nessuna barra dell'app visibile
       3. tocca 10 volte a caso lo sfondo dell'overlay → non succede NULLA
       4. tocco singolo sul bottone di uscita → non esce; tieni premuto ~0,6 s → esce, e il cronometro NON si è azzerato
       5. Chrome DevTools → Rendering → "Emulate a focused page" OFF, oppure passa a un'altra tab per 60 s → torna: il cronometro mostra il tempo REALE trascorso (prova che useElapsed lavora su Date.now())
       6. avvia un recupero da 60 s, blocca lo schermo del telefono per 30 s, riaccendi → il countdown è a ~30 s, non a ~55 s
       7. lascia scadere un recupero in Focus → beep + vibrazione una volta sola, non due
       8. iOS Safari e Android Chrome: l'overlay non è tagliato dalla barra URL né dall'home indicator (prova che 100dvh + safe-area funzionano)
       9. Impostazioni → tema scuro → riapri il Focus: aspetto IDENTICO al tema chiaro (prova che non stai usando classi riscritte da globals.css)
      10. su un dispositivo che supporta Wake Lock: la pill "Schermo attivo" compare e lo schermo non si spegne; uscendo dal Focus lo schermo torna a spegnersi normalmente
   - Riporta l'esito dei 10 punti nel riepilogo.
```

---

## MICRO-PROMPT 3 — `ExercisePicker` moderno + slot media per le demo

```
Lavora sul repo fitness-app. Task: rifare il layout di ExercisePicker e predisporre lo slot per video/animazioni di esecuzione. NON toccare exerciseData.ts (decine di record: il campo media deve essere opzionale, così il file compila senza modifiche). NON installare lottie-react in questo step. NON cambiare le props di ExercisePicker (open, onClose, onSelect, excludeIds) né il contratto onSelect(ExerciseDefinition).

A) app/today/_lib/types.ts — un solo campo, opzionale

   Aggiungi a ExerciseDefinition:
     /** Demo di esecuzione. Opzionale: oggi nessun esercizio la valorizza. */
     media?: { kind: "video" | "lottie" | "image"; src: string; poster?: string };

   Verifica con tsc che exerciseData.ts continui a compilare senza modifiche. Se non compila, hai reso il campo obbligatorio: correggi.

B) app/today/_components/Modal.tsx — prop size, retrocompatibile

   Aggiungi: size?: "md" | "lg"  (default "md").
   "md" → max-w-md (identico a oggi, tutti i chiamanti attuali restano invariati)
   "lg" → max-w-2xl
   In entrambi i casi aggiungi max-h-[90dvh] overflow-y-auto al pannello: oggi con liste lunghe il contenuto può uscire dallo schermo su mobile.
   Nient'altro. Il focus trap e role="dialog" sono un task di accessibilità a sé: non aprirlo qui.

C) Crea app/today/_components/ExerciseMediaSlot.tsx ("use client")

   interface ExerciseMediaSlotProps {
     media?: ExerciseDefinition["media"];
     name: string;
     className?: string;
   }

   - contenitore aspect-video w-full rounded-xl overflow-hidden bg-[#FAF7F0] border border-emerald-900/10
   - media assente (il caso di OGGI, per tutti gli esercizi) → placeholder: icona PlayCircle h-8 w-8 text-emerald-800/25 centrata, sotto testo "Demo in arrivo" text-[10px] font-bold uppercase tracking-widest text-emerald-800/30. Nessun bordo tratteggiato, nessun finto pulsante: non deve sembrare rotto né cliccabile.
   - kind "image" → <img src={media.src} alt={`Esecuzione di ${name}`} className="h-full w-full object-cover" loading="lazy" />
   - kind "video" → <video src={media.src} poster={media.poster} muted loop playsInline preload="none" controls={false} autoPlay className="h-full w-full object-cover" />
   - kind "lottie" → per ora RENDERIZZA IL PLACEHOLDER, con un commento: la libreria si aggiunge quando esisteranno asset reali. Il tipo è già nel contratto perché il giorno che arriva non si tocca né types.ts né i chiamanti.
   - il componente è puro presentazionale: nessun useState, nessun fetch, nessun import di context.

D) app/scheda/_components/ExercisePicker.tsx — nuovo layout

   Mantieni identici: usePlan(), la logica di availableMuscles, il filtro `filtered`, la chiamata onSelect(ex) + onClose(). Cambia solo la presentazione.

   1. <Modal ... size="lg">
   2. Ricerca: input più alto (py-3, text-base — sotto i 16px iOS zooma in automatico sul focus), icona Search invariata.
   3. Chip gruppi muscolari: da px-2.5 py-1 a px-3 py-2 (target ≥ 40px), scorrimento orizzontale su mobile invece del wrap:
      flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] con i chip in shrink-0. Su sm: torna a flex-wrap.
   4. Riga esercizio: da lista compatta a card con anteprima.
      - contenitore lista: max-h-[55dvh] (non più max-h-72 fisso)
      - ogni riga: min-h-[64px], griglia [thumb 56px | testo 1fr | Plus]
        thumb = <ExerciseMediaSlot media={ex.media} name={ex.name} className="h-14 w-14 shrink-0 !aspect-square" />
        testo = nome (text-sm font-semibold) + muscolo · attrezzo (text-xs text-emerald-800/50), come oggi
      - stati: hover:bg-emerald-50/50 (già presente), active:scale-[0.99], focus-visible:ring-2 focus-visible:ring-emerald-400
   5. ANTEPRIMA ESPANSA — il pezzo che predispone le demo future:
      accanto al Plus, un secondo bottone icona Info (h-4 w-4, aria-label `Vedi esecuzione di ${ex.name}`) che espande INLINE sotto la riga un blocco con <ExerciseMediaSlot media={ex.media} name={ex.name} /> a piena larghezza.
      - stato locale: const [previewId, setPreviewId] = useState<string | null>(null) — uno solo aperto per volta
      - ⚠️ il tap sulla riga continua a fare SOLO onSelect. Il tap sull'Info fa e.stopPropagation() e non seleziona. Due bersagli, due azioni, mai ambigui.
   6. Empty state: invariato nei testi, solo padding maggiore.

E) Verifica:
   - npx tsc --noEmit && npm run lint  → zero errori
   - npm run build deve passare
   - Collaudo visivo:
       1. /scheda → Modifica sessione → Aggiungi: il picker è più largo, la lista scorre, i chip scorrono in orizzontale su mobile
       2. ogni riga mostra il placeholder quadrato "Demo in arrivo": nessuna immagine rotta, nessun 404 in Network
       3. tap sull'Info → si apre l'anteprima inline e l'esercizio NON viene aggiunto alla sessione (è il caso che rompe più facilmente)
       4. tap sulla riga → l'esercizio viene aggiunto e il modale si chiude, esattamente come prima
       5. excludeIds continua a funzionare: gli esercizi già in sessione non compaiono
       6. valorizza a mano, temporaneamente, media su UN esercizio in exerciseData.ts con kind "image" e un URL qualsiasi → la thumb e l'anteprima lo mostrano; POI RIMUOVI la modifica e verifica con git status che exerciseData.ts sia pulito
       7. tutti gli altri chiamanti di Modal (SessionEditor, SessionSwitchModal in WorkoutCard, ecc.) sono invariati: stessa larghezza max-w-md di prima
       8. tema scuro: il picker resta leggibile (qui SÌ le classi standard, perché il picker deve seguire il tema — al contrario del Focus)
   - Riporta l'esito degli 8 punti nel riepilogo.
```

---

## Note di attenzione da tenere d'occhio in review

- **Il dark mode di `globals.css` è una trappola per qualsiasi componente nuovo.** Riscrive `.bg-white`, `.bg-emerald-50`, `.text-emerald-950`, `.border-emerald-900/10` con selettori di attributo. Regola pratica: *il Focus usa colori espliciti e ignora il tema; tutto il resto usa le classi standard e segue il tema*. Se in review vedi `bg-white` dentro `FocusShell`, è un bug.
- **Il passaggio a `Date.now()` cambia un dato salvato.** `durationSeconds` su `workout_logs` diventerà **più alta** di prima per le sessioni con schermo spento. Non è una regressione: prima era sbagliata. Vale la pena ricordarlo se `VolumeChart` o le medie di durata mostrano uno scalino tra i log vecchi e quelli nuovi.
- **Wake Lock non è disponibile ovunque e non è garantito.** iOS lo supporta da Safari 16.4, richiede secure context (su Vercel c'è) e viene rilasciato dal browser a ogni cambio tab. La UI deve trattarlo come un bonus: se manca, il Focus resta comunque utile perché il testo enorme si legge a un metro di distanza.
- **`FocusShell` non chiude su ESC per default.** È voluto: su mobile ESC non esiste e su desktop l'uscita accidentale costa meno. Se lo aggiungi, aggiungilo solo lì e non nel `RestTimer` a recupero in corso.
- **Focus trap e `role="dialog"` restano scoperti.** `Modal.tsx` non li ha oggi e questo task non li introduce: `FocusShell` non è un dialog (non c'è nulla dietro con cui interagire), quindi la priorità resta su `Modal`. È il candidato naturale per `@radix-ui/react-dialog` in un task successivo, insieme al `focus-visible` ring globale.
- **Lo slot media è un contratto, non una feature.** Finché `ExerciseDefinition.media` non è valorizzato da nessuno, il valore del task è che il giorno in cui arrivano gli asset (video hostati su Supabase Storage, o JSON Lottie) si tocca **solo `exerciseData.ts`**. Se un prompt ti porta a installare librerie di animazione adesso, ti sei allontanato dal task.
- **Se un giorno il Focus deve sopravvivere al reload** (utente che chiude per sbaglio il browser a metà recupero): la strada è salvare `endAt` in `active_sessions.data` (jsonb, già esistente, già in upsert fire-and-forget), non un nuovo storage. Il contratto di `useCountdown` non cambia: cambia solo chi produce `endAt`.

## Riferimenti nel repo

- `app/allenamento/_components/SessionTimer.tsx` — `formatTime` (esportata, usata da RestTimer), pattern `onTickRef`, interval accumulativo da sostituire
- `app/allenamento/_components/RestTimer.tsx` — `playBeep`, `REST_PRESETS`, effetto con deps `[active, remaining, onEnd]` da rifare, posizionamento `z-40 md:left-64`
- `app/allenamento/page.tsx` — proprietaria di `restActive`, `restDefault`, `durationSec`; `handleCompleteSet` avvia il recupero
- `app/allenamento/_components/ExerciseSetCard.tsx` — modalità `simple`/`advanced`, riferimento per lo stile dei controlli sotto sforzo
- `app/today/_components/Modal.tsx` — `max-w-md` fisso, chiusura su click esterno, niente focus trap
- `app/scheda/_components/ExercisePicker.tsx` — `usePlan().exercises`, filtro `filtered`, `excludeIds`, lista `max-h-72`
- `app/today/_lib/types.ts` — `ExerciseDefinition` (destinazione del campo `media`)
- `app/today/_lib/exerciseData.ts` — `muscleGroupLabels`, `equipmentLabels`; **da non modificare**
- `app/globals.css` — override dark mode su classi Tailwind letterali
- `app/impostazioni/_components/NotificationsSection.tsx` — conferma che non esiste Service Worker
- `AGENTS.md` — obbligo di consultare `node_modules/next/dist/docs/`
