# TASK: Sviluppo Atlante Esercizi Esteso, Dettaglio Tecnico e Preview Anatomica Fake-3D

**Ruolo:** Agisci come Sviluppatore Full-Stack & UI Lead. Lavora sul repo `fitness-app` (stack: Next.js 16, React 19, Tailwind CSS 4, Supabase).

## 0. Riassunto delle Decisioni Architetturali (Background)
Nelle precedenti fasi di design abbiamo stabilito i seguenti punti fissi per l'implementazione dell'interfaccia anatomica e delle demo:
- **Tecnica "Fake 3D" per l'anatomia:** Nessun motore WebGL/Three.js per evitare drain della batteria e lag. Utilizzeremo un'immagine raster base (PNG/WebP in scala di grigi ad alta risoluzione) che fornisce i volumi 3D, a cui sovrapporremo tracciati SVG trasparenti. Usando CSS `mix-blend-mode: multiply`, i colori piatti dell'SVG si fonderanno con le ombre del render 3D di base.
- **Evidenziazione muscolare:** I tracciati SVG dei muscoli verranno animati con colori distinti (es. rosso vivo per `primaryMuscles`, arancione/rosso scuro per `secondaryMuscles`) sfruttando transizioni fluide via Tailwind o Framer Motion.
- **Demo del movimento:** Nessuna animazione in real-time del modello. Useremo micro-video `.webm`/`.mp4` pre-renderizzati in loop perfetto all'interno di un tag `<video>` ottimizzato (autoplay, muted, playsInline) per mostrare l'esecuzione reale, garantendo il caching offline della PWA.

---

## 1. Contesto Tecnico Rilevato nel Repo

| Componente/File | Ruolo e Intervento Previsto |
| :--- | :--- |
| `app/today/_lib/types.ts` | **Update:** Estensione dell'interfaccia `Exercise` per includere `primaryMuscles`, `secondaryMuscles`, `instructions` (array di step), `demoVideoUrl`. |
| `app/today/_lib/exerciseData.ts` | **Update:** Arricchimento del mock/database locale con i nuovi campi per almeno un set di esercizi fondamentali. |
| `app/today/_components/MuscleMapSvg.tsx` | **Refactor:** Sostituzione delle forme geometriche con la logica "Fake 3D" (Image overlay + SVG path con ID muscolari e mix-blend-mode). |
| `app/today/_components/ExerciseDetailModal.tsx` | **Update:** Restyling per includere il media player video, la mappa anatomica aggiornata e la lista step-by-step. |
| `ExercisePicker` / `SessionEditor` / `ExerciseSetCard` | **Integrazione:** Trigger UI (es. pulsante "info") per aprire la modale di dettaglio senza interrompere il flusso. |

**Vincoli PWA e Caching:**
- Gli asset grafici (immagine base per SVG e micro-video demo) devono risiedere in `/public` o essere gestiti via Service Worker (se da CDN/Supabase Storage) per garantire l'accessibilità **offline**.
- Dimensione asset: Video WebM sotto i 500KB in loop; PNG base ottimizzato.

---

## 2. Decisioni Architetturali

1. **Struttura TypeScript Polimorfica:** I nuovi tipi devono prevedere campi opzionali per mantenere la retrocompatibilità con gli "esercizi custom" creati dall'utente (che potrebbero non avere un video demo o una mappa muscolare precisa).
2. **Architettura dell'SVG Anatomico:** Il componente `MuscleMapSvg` riceverà in prop `primaryMuscles` e `secondaryMuscles`. I tag `<path>` dell'SVG useranno identificatori semantici (es. `id="pectoralis_major"`) e classi dinamiche Tailwind per mappare il colore.
3. **Player Multimediale:** Il tag video dovrà strettamente includere `autoPlay loop muted playsInline` per superare i blocchi dei browser mobile.
4. **Accessibilità (WCAG AA):** Assicurare un contrasto di almeno 4.5:1 per le istruzioni step-by-step. Il `mix-blend-mode` deve garantire che il rosso muscolare sia distinguibile anche sullo sfondo scuro dell'app.

---

## 3. MICRO-PROMPT SEQUENZIALI

Esegui questi micro-prompt in ordine. Non passare al successivo finché il precedente non è completato e testato.

### Micro-Prompt 1: Aggiornamento Types e Data Layer
1. Modifica `app/today/_lib/types.ts`. Estendi o aggiorna l'interfaccia dell'esercizio aggiungendo i seguenti campi (opzionali per i custom):
   - `instructions?: string[]`
   - `primaryMuscles?: string[]`
   - `secondaryMuscles?: string[]`
   - `demoVideoUrl?: { webm: string, mp4?: string }`
2. Aggiorna `app/today/_lib/exerciseData.ts` (o file analogo di catalogo) compilando questi campi per almeno 3 esercizi (es. Panca piana, Squat, Trazioni).
3. Esegui il controllo rigoroso dei tipi: `npx tsc --noEmit`. Correggi eventuali errori nei file dipendenti che usano il tipo.

### Micro-Prompt 2: Implementazione Mappa Anatomica Fake-3D
1. Lavora su `app/today/_components/MuscleMapSvg.tsx`.
2. Struttura il componente con un container `relative`.
3. Inserisci un tag `<img>` di background (`/public/models/base-anatomica.webp` - usa un placeholder temporaneo se il file non esiste).
4. Sovrapponi un `<svg>` con `absolute w-full h-full mix-blend-multiply`.
5. Inserisci alcuni path SVG di esempio (es. pettorali, quadricipiti) con ID corrispondenti ai `primaryMuscles` e implementa la logica per colorarli dinamicamente di rosso/arancione basandoti sulle props ricevute, usando le transizioni di Tailwind 4.
6. Verifica il componente a livello TypeScript: `npx tsc --noEmit`.

### Micro-Prompt 3: Modale di Dettaglio (UI + Video Player)
1. Aggiorna `app/today/_components/ExerciseDetailModal.tsx`.
2. Suddividi il layout:
   - **Top:** Tag `<video>` per la preview multimediale (`autoPlay loop muted playsInline bg-zinc-900 object-cover`). Collega la prop `demoVideoUrl` dell'esercizio.
   - **Middle:** Il componente `MuscleMapSvg` aggiornato e una legenda visiva.
   - **Bottom:** Lista puntata chiara e accessibile (WCAG AA) che mappa l'array `instructions` per mostrare Setup, Fase Concentrica ed Eccentrica.
3. Esegui la convalida dei tipi: `npx tsc --noEmit`.

### Micro-Prompt 4: Integrazione Flusso UI e Build Final
1. Identifica i punti di ingresso principali: `app/scheda/_components/ExercisePicker.tsx`, `SessionEditor.tsx` e `app/allenamento/_components/ExerciseSetCard.tsx`.
2. Aggiungi un'icona (es. pulsante "Info" o un tap prolungato sull'immagine thumbnail dell'esercizio) per scatenare l'apertura di `ExerciseDetailModal` passando i dati corretti dell'esercizio.
3. Assicurati che l'apertura della modale non causi re-render inutili del timer di allenamento (se aperto da `ExerciseSetCard`).
4. Esegui una validazione finale del codice e la build: `npx tsc --noEmit` seguito da `npm run build`. Correggi eventuali warning di Next.js o eslint generati.