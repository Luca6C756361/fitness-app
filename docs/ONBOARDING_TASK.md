# Task — Sviluppatore 4: Onboarding Avanzato (Wizard Post-Registrazione, TDEE & Scheda Iniziale, Empty States)

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase, lucide-react, recharts).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `calcBMR(profile)` — **Mifflin-St Jeor già implementata** — e `calcTDEE(profile)` = BMR × `activityLabels[activity].multiplier` | `app/today/_lib/utils.ts` | ⚠️ **Le formule esistono già.** Lo step 3 del wizard le *importa*. Riscrivere Mifflin-St Jeor in `_lib/tdee.ts` è l'errore numero uno di questo task. |
| `activityLabels` con `multiplier` (1.2 / 1.375 / 1.55 / 1.725 / 1.9) e `description` in italiano | `app/today/_lib/data.ts` | Lo step 1 costruisce i radio del livello attività **da questa mappa**, non da un array nuovo. |
| `useUser()` → `profile`, `goals`, `loading`, `updateProfile(patch)`, `updateGoals(patch)` — due `UPDATE` separati sulla stessa riga | `app/today/_lib/UserContext.tsx` | Il salvataggio finale **non** può essere `updateProfile()` + `updateGoals()`: sono 2 round-trip con 2 rollback indipendenti. Serve un metodo nuovo (decisione 2). |
| `UserProvider` inizializza lo state con `defaultProfile` (`name: "Luca"`, `age: 21`, `weight: 75.4`) e `defaultGoals` | `app/today/_lib/UserContext.tsx` + `data.ts` | 🔴 **Un utente appena registrato vede dati finti di un'altra persona.** È esattamente il buco che questo task chiude. E rende impossibile dedurre "profilo incompleto" dai valori: serve un flag esplicito. |
| `PlanProvider` fa fallback su `defaultWeeklyPlan` (Push/Pull/Legs, 3 sessioni piene) quando la colonna `plan` è null o malformata | `app/today/_lib/PlanContext.tsx` | 🔴 **`/scheda` non è MAI vuota**, quindi oggi l'empty state richiesto non può nemmeno scattare. Va distinto "piano mai scelto" da "piano scelto e vuoto" (decisione 4). |
| `defaultWeeklyPlan` = PPL su Lun/Mer/Ven, `defaultSessions` con `exerciseId` reali | `app/today/_lib/exerciseData.ts` | Il template "avanzato" dello step 4 **è** `defaultWeeklyPlan`: importalo, non ricopiarlo. |
| `exerciseDatabase`: 36 esercizi, id kebab-case (`panca-piana`, `stacchi-rumeni`, …) | `app/today/_lib/exerciseData.ts` | Ogni `exerciseId` dei nuovi template deve esistere qui: un typo non dà errore TS, dà `"?"` in `SessionList`. Serve un check automatico. |
| `middleware.ts`: `!user && !isLogin → /login`; `user && isLogin → /today`; matcher su **tutto** tranne asset statici | `middleware.ts` | Il matcher intercetta ogni navigazione: una query Supabase qui costerebbe un round-trip per click (decisione 3). |
| `login/page.tsx` usa `window.location.assign("/today")`, non `router.push`, con commento esplicito sul middleware che deve rileggere il cookie | `app/login/page.tsx` | Il redirect di fine onboarding **copia questo pattern**: navigazione hard, così tutti i provider rileggono da Supabase. |
| `AppShell`, `Sidebar`, `BottomNav` si nascondono con `pathname.startsWith("/login")` | `app/_components/` | `/onboarding` va aggiunto alla stessa condizione, in tutti e tre. Sono 3 righe, non un refactor. |
| `WeightContext.addEntry(date, weight)` fa upsert su `weight_entries` PK `(user_id, date)` e riallinea `profiles.weight` | `app/today/_lib/WeightContext.tsx` | Il peso iniziale dello step 1 va registrato **anche** come misurazione, o `WeightHistoryChart` parte vuoto. L'upsert è idempotente → sicuro da rieseguire. |
| `FoodDiary` ha già un empty state testuale ("Nessun alimento aggiunto oggi") e riceve `entries/totals/onRemove` | `app/nutrition/_components/FoodDiary.tsx` | Va **sostituito**, non affiancato. Serve un prop nuovo per la CTA (decisione 5). |
| `SessionList` ha già un empty state testuale ("Nessuna sessione…") | `app/scheda/_components/SessionList.tsx` | Idem. |
| `Modal.tsx` esiste ed è riusabile | `app/today/_components/Modal.tsx` | Il wizard **non** è un modal: è una pagina full-screen. Modal resta per altro. |
| Palette: `bg-[#FAF7F0]`, card `rounded-2xl border border-emerald-900/5 bg-white shadow-sm`, titoli `text-xs font-bold uppercase tracking-widest text-emerald-800/70`, primario `bg-emerald-600`, secondario `bg-teal-600` | tutto il repo | Il wizard e gli empty state usano questa palette. Nessun colore nuovo. |
| Chiavi localStorage in uso: `fitness-app:todayOverride`, `fitapp:achievements:seen` | `PlanContext.tsx`, task Gamification | Due prefissi convivono. Per i nuovi hint usa **`fitapp:`**, il più recente. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Leggere `node_modules/next/dist/docs/` prima di toccare `middleware.ts` o creare route. Consultare `graph.json` prima di ogni import. |

### Schema Supabase coinvolto

| Tabella | Colonne | Operazione in questo task |
|---|---|---|
| `profiles` | `name, avatar, age, sex, height, weight, activity` | **UPDATE** (una sola volta, in blocco) |
| `profiles` | `goals` (jsonb), `plan` (jsonb) | **UPDATE** nella stessa istruzione |
| `profiles` | `onboarding_completed` (boolean) | 🆕 **COLONNA NUOVA — richiede una migrazione** |
| `weight_entries` | `date, weight` | **UPSERT** della prima misurazione, via `WeightContext.addEntry` |
| `diary_entries`, `workout_logs` | — | Non toccate |

> ⚠️ A differenza dei task precedenti, **questo richiede una migrazione SQL**. Una riga, più il backfill degli account esistenti (altrimenti al primo deploy vieni rispedito tu stesso nell'onboarding).

---

## Le 5 decisioni architetturali da rispettare

**1. Il "profilo incompleto" è un flag esplicito, non un'euristica.**
La tentazione è dedurre lo stato da `profile.name === ""` o `age === 0`. Non funziona: `UserProvider` inizializza con `defaultProfile`, quindi un utente senza riga in `profiles` legge *"Luca, 21 anni, 75.4 kg"*. Qualunque euristica su quei valori è indistinguibile dal caso "utente che si chiama davvero Luca". Una colonna `onboarding_completed boolean not null default false` costa una migrazione e rende la condizione binaria, ispezionabile dal DB e resettabile a mano durante i test.

**2. Il salvataggio è una sola `UPDATE`, e il flag è il punto di commit.**
Il client Supabase non ha transazioni. Ma l'atomicità che serve davvero è: *o l'utente è onboardato con tutti i dati, o non lo è affatto*. Si ottiene senza RPC con l'ordine giusto:

```
1. addEntry(oggi, peso)                       ← upsert idempotente, fallimento tollerabile
2. UPDATE profiles SET name, age, sex, height, weight, activity,
          goals = <jsonb>, plan = <jsonb>,
          onboarding_completed = true          ← UNA istruzione, il flag per ultimo
   WHERE id = user.id
3. window.location.assign("/today")
```

Se il passo 2 fallisce, `onboarding_completed` resta `false` e il wizard si ripete da capo: nessuno stato intermedio osservabile. Se fallisce il passo 1, il profilo è comunque completo e la misurazione si riaggiunge da `/profilo`. La versione davvero transazionale (funzione Postgres `complete_onboarding(payload jsonb)` con `security definer`) è l'upgrade path, non il punto di partenza: aggiunge una migrazione, una RLS e un punto di deploy in più per risolvere un problema che l'ordinamento già risolve.

**3. Il middleware legge un cookie, non il database.**
Il matcher del middleware intercetta ogni navigazione non-statica. Metterci `supabase.from("profiles").select("onboarding_completed")` significa **un round-trip di rete a ogni click**, su un percorso che oggi ne fa già uno (`auth.getUser()`). La divisione corretta:

- **Middleware** = fast path. Legge il cookie non-httpOnly `fitapp_onboarded`. Se assente e il path non è già `/onboarding` o `/login` → redirect a `/onboarding`. Costo: zero query.
- **`OnboardingGate`** (client, dentro il layout) = fonte di verità. Ha già `profile` e il flag in RAM da `UserContext`, che la query su `profiles` la fa comunque una volta sola. Riallinea il cookie e corregge il middleware quando questo ha sbagliato.

Le tre regole anti-loop, da rispettare alla lettera:

- `/onboarding` e `/login` sono **sempre** esclusi dal redirect verso `/onboarding`. Senza questa esclusione il loop è garantito al primo caricamento.
- Il redirect *inverso* (`/onboarding` → `/today` per chi è già onboardato) avviene **solo** nel gate client, **solo** dopo `loading === false`, e **mai** nel middleware. Due componenti che si rimbalzano lo stesso path da lati opposti sono la causa classica del ping-pong.
- Il cookie è **cache, non verità**: se il gate trova `onboarding_completed === true` ma il cookie manca, lo riscrive e non redirige. Un utente che pulisce i cookie finisce su `/onboarding`, che al mount rileva il flag già `true`, riscrive il cookie e lo rimanda a `/today`. Il sistema si auto-ripara invece di intrappolarsi.

**4. Il piano "mai scelto" e il piano "scelto e vuoto" sono stati diversi.**
Oggi `PlanContext` collassa entrambi su `defaultWeeklyPlan`, che è un piano PPL completo. Va esposto un `hasPersistedPlan: boolean` (true se la colonna `plan` conteneva un oggetto valido). Dopo l'onboarding il piano è **sempre** persistito — anche l'opzione "parto da zero", che scrive `{ sessions: [], weekMap: [null × 7] }`. Da quel momento `plan.sessions.length === 0` è un'informazione vera e l'empty state di `/scheda` è finalmente raggiungibile. Il fallback su `defaultWeeklyPlan` resta solo per gli account legacy.

**5. Gli empty state hanno CTA che funzionano davvero, quindi lo stato dello scanner sale di un livello.**
Un empty state con un pulsante decorativo è peggio di un paragrafo di testo. La CTA "Scansiona il primo prodotto" in `FoodDiary` deve aprire lo scanner, che oggi vive come stato interno di `FoodPicker`. La soluzione pulita è sollevare `scannerOpen` in `app/nutrition/page.tsx` (40 righe, già il proprietario di entrambi i figli) e passarlo controllato a `FoodPicker` e come callback a `FoodDiary`. Le alternative — un evento custom sul `window`, un `document.querySelector(...).click()`, un context nuovo per un booleano — sono tutte peggiori del prop drilling di un livello.

### Librerie da installare

**Nessuna.** Il wizard è React state + Tailwind. Le icone (`ArrowRight`, `ArrowLeft`, `ArrowUp`, `Check`, `Sparkles`, `Dumbbell`, `Target`, `Scale`, `Flame`, `ScanLine`, `Plus`, `LayoutTemplate`, `X`) sono già in `lucide-react`. Le verifiche dei file puri girano con `npx --yes tsx` su script temporanei, poi cancellati.

---

## MICRO-PROMPT 1 — Livello puro: migrazione, `tdee.ts`, `planTemplates.ts`

Copia da qui:

```
Lavora sul repo fitness-app. Task: livello logico dell'onboarding. NON creare pagine, NON toccare componenti UI, NON toccare il middleware in questo step.

Consulta graph.json e leggi PRIMA questi file, perché il grosso della logica esiste già e va riusata, non riscritta:
 - app/today/_lib/utils.ts        → calcBMR (Mifflin-St Jeor) e calcTDEE ESISTONO GIÀ
 - app/today/_lib/data.ts         → activityLabels con i moltiplicatori
 - app/today/_lib/types.ts        → UserProfile, UserGoals, Sex, ActivityLevel, WeeklyPlan, WorkoutSession, PlannedExercise
 - app/today/_lib/exerciseData.ts → exerciseDatabase (36 id) e defaultWeeklyPlan (PPL)

1) MIGRAZIONE SQL. Crea supabase/migrations/0001_onboarding_completed.sql con:

   alter table public.profiles
     add column if not exists onboarding_completed boolean not null default false;

   -- backfill: chi ha già un profilo compilato non deve rifare l'onboarding
   update public.profiles
     set onboarding_completed = true
     where name is not null and age is not null and height is not null;

   Non eseguirla tu. Nel riepilogo finale scrivi a chiare lettere che va lanciata a mano
   sull'SQL editor di Supabase PRIMA di provare il flusso, e che senza backfill
   l'account esistente verrà rispedito nel wizard.

2) Crea app/onboarding/_lib/tdee.ts. Vincoli: nessun import di React, next/*, supabase, lucide-react.
   File puro, testabile, commenti in italiano, stesso stile di prStats.ts.

   Tipi:
     export type FitnessGoal = "definizione" | "mantenimento" | "massa";
     export type ExperienceLevel = "principiante" | "intermedio" | "avanzato";

     export interface MacroSplit {
       kcal: number; protein: number; carbs: number; fat: number;  // g, interi
     }
     export interface TdeeBreakdown {
       bmr: number; tdee: number; split: MacroSplit;
       goalFactor: number; proteinPerKg: number;   // esposti per mostrarli nella UI
     }

   Etichette (usate dalla UI, definite qui per non duplicarle nei componenti):
     export const goalLabels: Record<FitnessGoal, { label: string; description: string; factor: number }>
       definizione   "Definizione"  "Perdere grasso mantenendo la massa"  factor 0.80
       mantenimento  "Mantenimento" "Restare al peso attuale"             factor 1.00
       massa         "Massa"        "Aumentare peso e forza"              factor 1.10
     export const experienceLabels: Record<ExperienceLevel, { label: string; description: string }>
       principiante "Principiante" "Meno di 6 mesi di palestra"
       intermedio   "Intermedio"   "6 mesi - 2 anni, tecnica solida"
       avanzato     "Avanzato"     "Oltre 2 anni, alleni per obiettivi"

   export function buildMacroSplit(profile: UserProfile, goal: FitnessGoal): TdeeBreakdown
     - bmr  = calcBMR(profile)     ← IMPORTA da ../../today/_lib/utils, non riscriverla
     - tdee = calcTDEE(profile)    ← idem
     - kcal = arrotonda tdee * goalLabels[goal].factor alla decina più vicina
     - proteine: g/kg di peso corporeo → definizione 2.0, mantenimento 1.8, massa 1.8
       (in deficit se ne alzano per preservare massa magra; il range di consenso per
        chi si allena coi pesi è 1.6-2.2 g/kg)
     - grassi: 25% delle kcal / 9, con pavimento a 0.8 g/kg di peso corporeo
     - carboidrati: kcal residue / 4
     - GUARDIA OBBLIGATORIA: se i carbo risultano < 50 g (succede con deficit aggressivi
       su soggetti leggeri), riduci i grassi al 20% e ricalcola; se restano < 0, clampa a 0.
       Il risultato non deve MAI contenere valori negativi o NaN.
     - arrotonda i macro ai 5 g più vicini, le kcal alla decina
     - non modificare `profile`

   export function suggestWeightTarget(weight: number, goal: FitnessGoal): number
     definizione → weight * 0.95, massa → weight * 1.05, mantenimento → weight
     arrotondato ai 0.5 kg

   export function toUserGoals(b: TdeeBreakdown, weightTarget: number): UserGoals
     mappa sul tipo UserGoals esistente { weightTarget, kcalTarget, carbsTarget, proteinTarget, fatTarget }

   export function isProfileStepValid(p: Partial<UserProfile>): boolean
     name non vuoto, age 16-100, height 120-230, weight 30-300, sex e activity valorizzati.
     Ritorna false, non lancia.

3) Crea app/onboarding/_lib/planTemplates.ts:

   export interface PlanTemplate {
     id: ExperienceLevel | "vuoto";
     name: string;            // es. "Full Body 3x"
     description: string;     // una riga, max 80 caratteri
     daysPerWeek: number;
     plan: WeeklyPlan;
   }
   export const PLAN_TEMPLATES: PlanTemplate[]

   Quattro voci, in quest'ordine:
   a) principiante → "Full Body 3x": due sessioni A/B alternate su Lun/Mer/Ven
      (weekMap: [null,"fb-a",null,"fb-b",null,"fb-a",null]).
      A: squat, panca-piana, rematore-bilanciere, military-press, plank
      B: stacchi-rumeni, lat-machine, panca-inclinata, affondi, crunch
      4 serie x 8 per i fondamentali, 3 x 12 per il resto.
   b) intermedio → "Upper / Lower 4x": upper su Lun/Gio, lower su Mar/Ven.
      Upper: panca-piana, trazioni, military-press, rematore-bilanciere, curl-bilanciere, pushdown-cavo
      Lower: squat, stacchi-rumeni, leg-press, leg-curl, calf-raise
   c) avanzato → "Push / Pull / Legs": { ...defaultWeeklyPlan } IMPORTATO da exerciseData.
      NON ricopiare le sessioni a mano.
   d) vuoto → "Parto da zero": plan { sessions: [], weekMap: [null,null,null,null,null,null,null] }

   Regole tassative:
   - ogni exerciseId deve esistere in exerciseDatabase
   - ogni PlannedExercise.id è unico DENTRO la sua sessione
   - weekMap ha esattamente length 7, indice 0 = domenica
   - estimatedMinutes coerente (~ exercises.length * 10, arrotondato ai 5)

4) VERIFICA, obbligatoria prima di dichiarare finito:
   - npx tsc --noEmit && npm run lint  → zero errori
   - crea uno script temporaneo /tmp/check-onboarding.ts ed eseguilo con npx --yes tsx.
     Deve asserire e stampare:
     a) ogni exerciseId di ogni template esiste in exerciseDatabase (stampa gli id orfani)
     b) ogni weekMap ha length 7 e ogni id in weekMap esiste tra le sessions di quel template
     c) gli id dei PlannedExercise sono unici per sessione
     d) buildMacroSplit su questi 3 casi, con macro tutti >= 0 e
        (protein*4 + carbs*4 + fat*9) entro il 3% delle kcal:
        - M, 21 anni, 178 cm, 75 kg, moderate, definizione
        - F, 30 anni, 160 cm, 52 kg, sedentary, definizione   ← caso critico per la guardia sui carbo
        - M, 45 anni, 185 cm, 95 kg, veryActive, massa
     e) suggestWeightTarget nei 3 goal
   - cancella lo script e incolla l'output nel riepilogo.
```

---

## MICRO-PROMPT 2 — Il wizard `/onboarding` e il gate anti-loop

```
Lavora sul repo fitness-app. Task: pagina wizard e redirect. Presuppone che il MICRO-PROMPT 1 sia già applicato e che la migrazione SQL sia stata eseguita su Supabase.

Prima di toccare middleware.ts leggi node_modules/next/dist/docs/ sui middleware e sui cookie di questa versione di Next: ha breaking change rispetto a quello che credi di sapere. Consulta graph.json prima degli import.

A) UserContext — un solo metodo nuovo, in app/today/_lib/UserContext.tsx

   1. Aggiungi al select esistente la colonna onboarding_completed e tienila nello state:
      const [onboardingCompleted, setOnboardingCompleted] = useState(false);
      Esponila nel value del provider come `onboardingCompleted`.
   2. Aggiungi UN metodo, senza toccare updateProfile/updateGoals:

      completeOnboarding: (payload: {
        profile: UserProfile; goals: UserGoals; plan: WeeklyPlan;
      }) => Promise<{ ok: boolean; error?: string }>

      Implementazione: UNA SOLA supabase.from("profiles").update({...}) che scrive
      name, avatar, age, sex, height, weight, activity, goals, plan e
      onboarding_completed: true, con .eq("id", user.id).
      NON usare update ottimistico qui: aggiorna lo state solo dopo il successo, e
      ritorna { ok:false, error } invece di lanciare. Il chiamante deve poter mostrare
      l'errore e lasciare l'utente sul wizard con i dati ancora in RAM.
      Se la riga non esiste ancora (count 0 aggiornate), usa upsert con id: user.id.

B) app/onboarding/page.tsx — "use client", 4 step, stato in RAM

   Stato unico: un oggetto `draft` con i campi dei 4 step + `step: 1|2|3|4`.
   Niente localStorage, niente scritture parziali su Supabase: finché non si conferma,
   l'onboarding non esiste sul server.

   Step 1 — Dati biometrici
     nome, sesso biologico (due bottoni M/F, stesso markup di ProfileForm),
     età, altezza, peso, livello di attività (radio card costruite da activityLabels).
     "Avanti" disabilitato finché isProfileStepValid è false, con messaggi di errore
     per campo (non un alert generico).

   Step 2 — Obiettivo ed esperienza
     3 card obiettivo da goalLabels, 3 card esperienza da experienceLabels.
     Selezione singola, entrambe obbligatorie.

   Step 3 — Revisione TDEE (calcolo in RAM, zero rete)
     Chiama buildMacroSplit(draft.profile, draft.goal) e mostra:
       - BMR e TDEE con una riga che spiega da dove vengono
         ("Mifflin-St Jeor x moltiplicatore attività")
       - le kcal obiettivo con il fattore applicato (es. "TDEE 2540 - 20% = 2030 kcal")
       - i 3 macro in grammi e la loro percentuale
       - il peso target suggerito
     I 4 valori (kcal, carbo, prot, grassi) e il peso target sono EDITABILI:
     input numerici precompilati, con un bottone "Ripristina calcolo" che rilegge da
     buildMacroSplit. Riusa lo stile degli input di GoalsForm.
     Sotto, in text-[11px] text-emerald-800/50: "Stime indicative da rivedere in base
     ai risultati reali. Non sostituiscono un parere professionale."

   Step 4 — Scheda iniziale
     Le 4 card di PLAN_TEMPLATES, con nome, descrizione, giorni/settimana e l'anteprima
     dei primi 3 esercizi risolti via exerciseDatabase (stesso pattern di SessionList).
     Preselezione suggerita in base a draft.experience, ma l'utente può scegliere qualsiasi
     template, "Parto da zero" incluso.

   Conferma finale (bottone dello step 4):
     1. await addEntry(todayISO(), draft.weight)      ← da useWeight, upsert idempotente
     2. const res = await completeOnboarding({ profile, goals, plan })
     3. se res.ok === false → mostra l'errore inline, riabilita il bottone, NON navigare
     4. se ok → document.cookie = "fitapp_onboarded=1; path=/; max-age=31536000; samesite=lax"
        poi window.location.assign("/today")
        Navigazione hard, non router.push: serve a far rileggere Supabase a tutti i
        provider (stesso pattern e stessa motivazione di login/page.tsx).
     Durante il salvataggio: bottone disabilitato con spinner. Un doppio click non deve
     produrre due UPDATE.

   UI: full-screen su bg-[#FAF7F0], contenuto in mx-auto max-w-xl, card
   rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm.
   In testa una progress bar a 4 segmenti (emerald-600 pieni / emerald-100 vuoti) con
   "Passo N di 4". "Indietro" sempre disponibile tranne allo step 1 e durante il salvataggio.
   Il draft NON si perde tornando indietro.

C) Gate e redirect — le tre regole anti-loop

   1. middleware.ts, dentro il blocco `if (user)`, DOPO il redirect esistente da /login:
        const onboarded = request.cookies.get("fitapp_onboarded")?.value === "1";
        const isOnboarding = request.nextUrl.pathname.startsWith("/onboarding");
        if (!onboarded && !isOnboarding && !isLogin) return redirectTo("/onboarding");
      Usa la helper redirectTo già presente: propaga i cookie rinnovati, un
      NextResponse.redirect nudo li perderebbe e ti sloggherebbe.
      NON aggiungere qui il redirect inverso /onboarding -> /today.
      NON interrogare Supabase nel middleware.

   2. Crea app/_components/OnboardingGate.tsx, "use client", montato nel layout DENTRO
      UserProvider (gli serve useUser) e attorno ad AppShell:
        - const { onboardingCompleted, loading } = useUser(); const { user } = useAuth();
        - finché loading è true: non redirigere e non renderizzare i children,
          mostra uno scheletro neutro su bg-[#FAF7F0]. Redirigere durante il caricamento
          è il secondo modo classico per creare un loop.
        - se !user oppure pathname è /login o /onboarding → renderizza i children e basta
        - se onboardingCompleted === true e il cookie manca → riscrivi il cookie, nessun redirect
        - se onboardingCompleted === false → router.replace("/onboarding") (replace, non push:
          il back non deve tornare nella pagina protetta)
        - se onboardingCompleted === true e pathname === "/onboarding" → router.replace("/today")
          Questo è l'UNICO punto dell'app dove esiste il redirect inverso.

   3. Nascondi la chrome su /onboarding: in AppShell.tsx, Sidebar.tsx e BottomNav.tsx
      estendi la condizione esistente da
        pathname.startsWith("/login")
      a
        pathname.startsWith("/login") || pathname.startsWith("/onboarding")
      Tre file, una riga ciascuno. Non introdurre un context per questo.

D) VERIFICA, obbligatoria:
   - npx tsc --noEmit && npm run lint && npm run build → tutti verdi
   - Collaudo manuale con la migrazione già applicata:
     1. su Supabase, sul tuo utente: update profiles set onboarding_completed = false;
     2. ricarica /today → devi finire su /onboarding SENZA loop
        (controlla il tab Network: nessuna catena di 307 ripetuti)
     3. completa i 4 step → atterri su /today con nome, kcal e scheda TUOI,
        non con "Luca / 2200 kcal"
     4. verifica su Supabase che la riga profiles abbia name, age, goals, plan e
        onboarding_completed = true, e che weight_entries abbia la misurazione di oggi
     5. naviga a mano su /onboarding → devi essere rimandato a /today
     6. cancella il cookie fitapp_onboarded dai DevTools e ricarica → devi finire su
        /onboarding e tornare SUBITO su /today da solo, cookie riscritto (auto-riparazione)
     7. logout e login → nessun passaggio dall'onboarding
   - Riporta l'esito dei 7 punti nel riepilogo.
```

---

## MICRO-PROMPT 3 — Empty states e hint di prima interazione

```
Lavora sul repo fitness-app. Task: empty state di /scheda e /nutrition + hint dismissibili.
Presuppone i MICRO-PROMPT 1 e 2 applicati.

A) PlanContext — distinguere "mai scelto" da "scelto e vuoto"
   In app/today/_lib/PlanContext.tsx:
     const [hasPersistedPlan, setHasPersistedPlan] = useState(false);
   Nell'effect che legge la colonna plan: setHasPersistedPlan(true) SOLO nel ramo in cui
   raw è valido (Array.isArray(raw.sessions) && Array.isArray(raw.weekMap)); false nel
   fallback su defaultWeeklyPlan. Esponilo nel value.
   NON cambiare il fallback: gli account legacy devono continuare a vedere il PPL.

B) app/_components/FirstRunHint.tsx — "use client", riusabile
     interface FirstRunHintProps {
       id: string;                                  // chiave localStorage
       text: string;
       arrow?: "up" | "left" | "none";
       children?: React.ReactNode;                  // slot per una CTA
     }
   - persistenza: localStorage "fitapp:hints:seen" = string[] di id già chiusi.
     Leggi in un useEffect, MAI durante il render: leggere localStorage nel corpo del
     componente causa hydration mismatch (stesso motivo per cui PlanContext calcola
     dayIndex in un effect).
   - finché non hai letto localStorage non renderizzare nulla (evita il flash)
   - box bg-teal-50 border border-teal-200 rounded-xl p-3, testo text-xs text-teal-900,
     bottone X in alto a destra con aria-label "Nascondi suggerimento"
   - freccia: ArrowUp su mobile, ArrowLeft da lg in su (due icone con classi responsive
     block/hidden), animate-bounce solo su "up"
   - avvolgi tutto in un try/catch: localStorage può lanciare in modalità privata

C) /scheda — empty state con due CTA reali
   In SessionList.tsx sostituisci il paragrafo "Nessuna sessione..." con un empty state:
     - icona ClipboardList in un cerchio bg-emerald-50 h-12 w-12
     - titolo "Nessuna scheda attiva"
     - una riga: "Costruiscila esercizio per esercizio, oppure parti da un template."
     - due bottoni affiancati (grid grid-cols-1 sm:grid-cols-2 gap-2):
       "Crea da zero"        → bg-emerald-600, apre il SessionEditor vuoto (openNew(), esiste già)
       "Scegli un template"  → bg-teal-600, apre un nuovo <TemplatePickerModal>
   Condizione di visualizzazione: (plan?.sessions?.length ?? 0) === 0. Con hasPersistedPlan
   false NON mostrarlo: quell'utente sta vedendo il PPL di default e un "nessuna scheda"
   sarebbe una bugia.

   Crea app/scheda/_components/TemplatePickerModal.tsx:
     - riusa app/today/_components/Modal.tsx
     - elenca PLAN_TEMPLATES da app/onboarding/_lib/planTemplates (escludi "vuoto")
     - stesse card dello step 4 del wizard: nome, descrizione, giorni/settimana,
       anteprima dei primi 3 esercizi
     - alla conferma: applica il template con i metodi ESISTENTI di PlanContext
       (createSession per ogni sessione, poi overrideDay per ogni giorno del weekMap).
       Non aggiungere un metodo nuovo al context e non scrivere su Supabase da qui.
     - conferma inline se il piano non è vuoto: "Sostituire la scheda attuale?"

   In WeekView.tsx: se plan.sessions è vuoto, sopra la lista dei 7 giorni mostra una riga
   text-xs text-emerald-800/50 "Crea prima una sessione per poterla assegnare ai giorni."
   e disabilita i select. Non nascondere la settimana: serve come anteprima della struttura.

D) /nutrition — empty state con CTA che apre davvero lo scanner
   1. In app/nutrition/page.tsx solleva lo stato:
        const [scannerOpen, setScannerOpen] = useState(false);
      Passa a FoodPicker due prop nuove `scannerOpen` e `onScannerOpenChange`, e a FoodDiary
      `onStartScan={() => setScannerOpen(true)}`.
   2. In FoodPicker.tsx rimuovi lo useState interno di scannerOpen e usa le prop.
      NON toccare handleDetected né la logica di lookup: cambia solo chi possiede il booleano.
   3. In FoodDiary.tsx sostituisci "Nessun alimento aggiunto oggi..." con:
        - icona UtensilsCrossed in un cerchio bg-emerald-50 h-12 w-12
        - titolo "Il diario di oggi è vuoto"
        - riga: "Scansiona un codice a barre o cerca un alimento per iniziare."
        - bottone "Scansiona un prodotto" (bg-emerald-600, icona ScanLine) → onStartScan()
        - sotto, un <FirstRunHint id="nutrition-picker" arrow="up"
          text="Puoi anche cercare tra gli alimenti qui sopra." />
          La freccia "up" è corretta: in grid-cols-1 su mobile FoodPicker sta sopra FoodDiary;
          da lg in su la freccia diventa "left" perché le due card sono affiancate.
        - `onStartScan` è opzionale (`onStartScan?: () => void`): senza la prop il bottone
          non si renderizza, così il componente resta usabile altrove.
   4. NON toccare i totali, la firma di onRemove, il calcolo del factor.

E) VERIFICA, obbligatoria:
   - npx tsc --noEmit && npm run lint && npm run build → tutti verdi
   - Collaudo manuale:
     1. su Supabase: update profiles set plan = '{"sessions":[],"weekMap":[null,null,null,null,null,null,null]}';
        → /scheda mostra l'empty state con le due CTA
     2. "Scegli un template" → scegli Upper/Lower → le sessioni appaiono in SessionList
        E i giorni risultano assegnati in WeekView
     3. ricarica → il piano è persistito (verifica la colonna plan su Supabase)
     4. update profiles set plan = null → /scheda torna a mostrare il PPL di default
        SENZA empty state (regola di hasPersistedPlan)
     5. svuota diary_entries di oggi → /nutrition mostra l'empty state; il bottone
        "Scansiona un prodotto" APRE la fotocamera
     6. chiudi il FirstRunHint, ricarica → resta chiuso; svuota
        localStorage["fitapp:hints:seen"] → riappare
     7. DevTools in modalità responsive: la freccia dell'hint punta in alto su 375px
        e a sinistra su 1280px
   - Riporta l'esito dei 7 punti nel riepilogo.
```

---

## Note di attenzione da tenere d'occhio in review

- **La migrazione è l'unico passo manuale.** Se `onboarding_completed` non esiste, il `select` di `UserContext` fallisce con `column does not exist` e — per come è scritto oggi il provider — l'errore finisce solo in `console.error`, lasciando il profilo sui valori di default: sintomo "vedo Luca 21 anni", causa "migrazione non lanciata". Vale la pena aggiungere un log esplicito nel catch.
- **`defaultProfile` resta nel codice.** Dopo questo task nessun utente onboardato lo vede più, ma continua a essere il valore iniziale dello state prima che la query risponda. Non cancellarlo: serve a evitare `null` durante il caricamento. Semmai, in un task futuro, sostituiscilo con un profilo neutro (`name: ""`, `weight: 0`) e rendi i componenti tolleranti allo zero.
- **Il cookie `fitapp_onboarded` non è un controllo di sicurezza.** È un'ottimizzazione: chiunque può scriverselo dai DevTools e saltare il wizard. Va bene, perché saltare l'onboarding non dà accesso a dati altrui — le RLS di Supabase restano l'unica barriera vera. Non usare mai questo pattern per gating di autorizzazione.
- **`proteinPerKg` è calcolato sul peso corporeo totale**, non sulla massa magra. Con soggetti molto sovrappeso sovrastima le proteine; la versione corretta userebbe il peso ideale o la LBM, che però richiede la percentuale di grasso — un dato che l'app non chiede. Se un giorno aggiungi il body fat %, questo è il punto da rivedere.
- **Lo step 3 è puro calcolo in RAM**, quindi è l'unica parte del wizard testabile senza browser e senza rete: se qualcosa nei numeri non torna, il debug si fa nello script `tsx`, non cliccando nel wizard.
- **Doppio salvataggio.** Il bottone di conferma deve essere disabilitato durante l'await. Senza, un doppio tap su mobile manda due `UPDATE` e due `addEntry`: l'upsert del peso è idempotente, l'update del profilo pure, quindi non corrompe nulla — ma genera due redirect concorrenti e una race su `window.location`.
