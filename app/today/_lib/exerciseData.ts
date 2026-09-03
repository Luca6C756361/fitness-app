import type {
  ExerciseDefinition,
  WeeklyPlan,
  WorkoutSession,
} from "./types";

/**
 * Database esercizi. 76 esercizi con gruppo primario, secondari, attrezzatura,
 * istruzioni tecniche e mappa muscolare anatomica (instructions / muscleMap).
 * Estendibile: aggiungi qui e diventano disponibili nell'editor scheda / composizione.
 */
export const exerciseDatabase: ExerciseDefinition[] = [
  // ============ PETTO ============
  {
    id: "panca-piana", name: "Panca piana con bilanciere", primaryMuscle: "petto", secondaryMuscles: ["tricipiti", "spalle"], equipment: "bilanciere",
    instructions: {
      setup: ["Sdraiati sulla panca con scapole retratte e piedi ben piantati a terra", "Impugna il bilanciere leggermente più largo delle spalle", "Sblocca il bilanciere e portalo sopra il petto con le braccia estese"],
      concentric: ["Spingi il bilanciere verso l'alto mantenendo i gomiti a circa 45° dal busto", "Espira durante la spinta"],
      eccentric: ["Abbassa il bilanciere in modo controllato fino a sfiorare il petto", "Mantieni le scapole retratte per tutta la discesa"],
      commonMistakes: ["Rimbalzare il bilanciere sul petto", "Sollevare i glutei dalla panca", "Gomiti troppo aperti a 90°"],
    },
    muscleMap: { primary: ["pettorale-medio", "pettorale-inferiore"], secondary: ["tricipite-capo-laterale", "deltoide-anteriore"] },
  },
  {
    id: "panca-inclinata", name: "Panca inclinata con manubri", primaryMuscle: "petto", secondaryMuscles: ["spalle", "tricipiti"], equipment: "manubri",
    instructions: {
      setup: ["Regola la panca a 30-45°", "Siediti con un manubrio per gamba, poi sdraiati portandoli sopra il petto"],
      concentric: ["Spingi i manubri verso l'alto convergendo leggermente in alto"],
      eccentric: ["Abbassa i manubri fino a sentire lo stretch sul petto alto, gomiti a 45°"],
      commonMistakes: ["Inclinazione panca troppo alta (diventa lavoro di spalle)", "Far scontrare i manubri troppo presto"],
    },
    muscleMap: { primary: ["pettorale-superiore"], secondary: ["deltoide-anteriore", "tricipite-capo-laterale"] },
  },
  {
    id: "croci-cavi", name: "Croci ai cavi", primaryMuscle: "petto", secondaryMuscles: [], equipment: "cavi",
    instructions: {
      setup: ["Posiziona le pulegge in alto, afferra le maniglie e fai un passo avanti", "Busto leggermente inclinato in avanti, gomiti leggermente flessi"],
      concentric: ["Porta le mani verso il basso e in avanti disegnando un arco, fino a incrociarle davanti al bacino"],
      eccentric: ["Riapri le braccia lentamente seguendo lo stesso arco fino allo stretch"],
      commonMistakes: ["Trasformare il movimento in una spinta piegando troppo i gomiti", "Usare carichi eccessivi perdendo il controllo dell'arco"],
    },
    muscleMap: { primary: ["pettorale-medio"], secondary: ["deltoide-anteriore"] },
  },
  {
    id: "dip-parallele", name: "Dip alle parallele", primaryMuscle: "petto", secondaryMuscles: ["tricipiti", "spalle"], equipment: "corpo-libero",
    instructions: {
      setup: ["Afferra le parallele e solleva il corpo a braccia tese", "Inclina leggermente il busto in avanti per enfatizzare il petto"],
      concentric: ["Spingi verso l'alto tornando a braccia tese"],
      eccentric: ["Scendi flettendo i gomiti finché le spalle non superano leggermente i gomiti"],
      commonMistakes: ["Scendere troppo caricando eccessivamente le spalle", "Busto troppo verticale (diventa un esercizio per tricipiti)"],
    },
    muscleMap: { primary: ["pettorale-inferiore"], secondary: ["tricipite-capo-laterale", "deltoide-anteriore"] },
  },
  {
    id: "push-up", name: "Piegamenti (Push-up)", primaryMuscle: "petto", secondaryMuscles: ["tricipiti", "core"], equipment: "corpo-libero",
    instructions: {
      setup: ["Mani leggermente più larghe delle spalle, corpo in linea retta dai talloni alla testa"],
      concentric: ["Spingi il corpo verso l'alto fino a braccia tese, mantenendo il core contratto"],
      eccentric: ["Scendi in modo controllato fino a sfiorare il pavimento con il petto"],
      commonMistakes: ["Bacino che cede verso il basso", "Gomiti completamente aperti a 90° (stress sulle spalle)"],
    },
    muscleMap: { primary: ["pettorale-medio"], secondary: ["tricipite-capo-laterale", "core-profondo"] },
  },
  {
    id: "panca-declinata", name: "Panca declinata con bilanciere", primaryMuscle: "petto", secondaryMuscles: ["tricipiti"], equipment: "bilanciere",
    instructions: {
      setup: ["Blocca i piedi nell'apposito supporto della panca declinata", "Sblocca il bilanciere e portalo sopra il petto basso"],
      concentric: ["Spingi il bilanciere verso l'alto in linea con il petto basso"],
      eccentric: ["Abbassa il bilanciere fino a sfiorare la parte bassa del petto"],
      commonMistakes: ["Traiettoria troppo verticale che scarica il petto basso", "Scendere troppo velocemente"],
    },
    muscleMap: { primary: ["pettorale-inferiore"], secondary: ["tricipite-capo-laterale"] },
  },
  {
    id: "croci-panca-manubri", name: "Croci su panca piana con manubri", primaryMuscle: "petto", secondaryMuscles: [], equipment: "manubri",
    instructions: {
      setup: ["Sdraiati sulla panca con un manubrio per mano sopra il petto, palmi rivolti l'uno verso l'altro"],
      concentric: ["Chiudi le braccia riportando i manubri sopra il petto con un movimento ad arco"],
      eccentric: ["Apri le braccia lateralmente mantenendo una leggera flessione dei gomiti fino allo stretch"],
      commonMistakes: ["Gomiti completamente estesi (rischio articolare)", "Scendere troppo in profondità perdendo tensione"],
    },
    muscleMap: { primary: ["pettorale-medio"], secondary: ["deltoide-anteriore"] },
  },
  {
    id: "chest-press-macchina", name: "Chest press alla macchina", primaryMuscle: "petto", secondaryMuscles: ["tricipiti"], equipment: "macchina",
    instructions: {
      setup: ["Regola il sedile in modo che le maniglie siano all'altezza del petto medio"],
      concentric: ["Spingi le maniglie in avanti fino a quasi estendere le braccia"],
      eccentric: ["Torna alla posizione di partenza controllando il movimento"],
      commonMistakes: ["Sedile regolato troppo alto o troppo basso", "Bloccare i gomiti con forza a fine spinta"],
    },
    muscleMap: { primary: ["pettorale-medio", "pettorale-inferiore"], secondary: ["tricipite-capo-laterale"] },
  },
  {
    id: "pec-deck", name: "Pec deck (Peck deck)", primaryMuscle: "petto", secondaryMuscles: [], equipment: "macchina",
    instructions: {
      setup: ["Siediti con la schiena aderente allo schienale, avambracci sui cuscinetti"],
      concentric: ["Chiudi i cuscinetti davanti al petto contraendo il pettorale"],
      eccentric: ["Riapri lentamente le braccia fino allo stretch"],
      commonMistakes: ["Usare lo slancio della schiena", "Range di movimento eccessivo che stressa le spalle"],
    },
    muscleMap: { primary: ["pettorale-medio"], secondary: [] },
  },

  // ============ SCHIENA ============
  {
    id: "trazioni", name: "Trazioni alla sbarra", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "corpo-libero",
    instructions: {
      setup: ["Afferra la sbarra con presa prona poco più larga delle spalle", "Parti da un dead-hang a braccia tese"],
      concentric: ["Tira il corpo verso l'alto portando il mento sopra la sbarra"],
      eccentric: ["Scendi in modo controllato fino a braccia tese"],
      commonMistakes: ["Usare lo slancio (kipping) senza controllo", "Range di movimento parziale"],
    },
    muscleMap: { primary: ["gran-dorsale"], secondary: ["bicipite-brachiale", "trapezio-medio"] },
  },
  {
    id: "stacchi", name: "Stacchi da terra", primaryMuscle: "schiena", secondaryMuscles: ["femorali", "glutei"], equipment: "bilanciere",
    instructions: {
      setup: ["Bilanciere vicino agli stinchi, piedi larghezza bacino, schiena neutra", "Afferra il bilanciere appena fuori dalle gambe"],
      concentric: ["Spingi con i talloni ed estendi anche e ginocchia simultaneamente fino alla posizione eretta"],
      eccentric: ["Fai scorrere il bilanciere lungo le gambe abbassandolo con schiena neutra"],
      commonMistakes: ["Arrotondare la schiena bassa", "Bilanciere che si allontana dal corpo"],
    },
    muscleMap: { primary: ["lombari", "gran-dorsale"], secondary: ["femorale-bicipite", "gluteo-massimo", "trapezio-medio"] },
  },
  {
    id: "rematore-bilanciere", name: "Rematore con bilanciere", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "bilanciere",
    instructions: {
      setup: ["Busto inclinato a circa 45° con schiena neutra, bilanciere sotto le spalle"],
      concentric: ["Tira il bilanciere verso l'addome portando i gomiti indietro"],
      eccentric: ["Distendi le braccia in modo controllato senza perdere l'inclinazione del busto"],
      commonMistakes: ["Raddrizzare il busto durante la tirata (slancio)", "Schiena bassa arrotondata"],
    },
    muscleMap: { primary: ["gran-dorsale", "trapezio-medio"], secondary: ["bicipite-brachiale", "romboidi"] },
  },
  {
    id: "lat-machine", name: "Lat machine", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "macchina",
    instructions: {
      setup: ["Siediti bloccando le cosce sotto il supporto, afferra il bilanciere largo"],
      concentric: ["Tira il bilanciere verso il petto alto portando i gomiti verso il basso"],
      eccentric: ["Distendi le braccia lentamente fino allo stretch completo"],
      commonMistakes: ["Tirare il bilanciere dietro la nuca", "Usare lo slancio del busto"],
    },
    muscleMap: { primary: ["gran-dorsale"], secondary: ["bicipite-brachiale"] },
  },
  {
    id: "pulley-basso", name: "Pulley basso", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "cavi",
    instructions: {
      setup: ["Siediti con ginocchia leggermente flesse, afferra la maniglia con braccia tese"],
      concentric: ["Tira la maniglia verso l'addome mantenendo la schiena eretta"],
      eccentric: ["Ritorna in avanti allungando le braccia mantenendo la schiena neutra"],
      commonMistakes: ["Dondolare il busto avanti e indietro", "Spalle che si curvano in avanti a fine tirata"],
    },
    muscleMap: { primary: ["gran-dorsale", "trapezio-medio"], secondary: ["bicipite-brachiale", "romboidi"] },
  },
  {
    id: "rematore-manubrio", name: "Rematore con manubrio (unilaterale)", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "manubri",
    instructions: {
      setup: ["Appoggia ginocchio e mano su una panca, schiena parallela al suolo, manubrio nell'altra mano"],
      concentric: ["Tira il manubrio verso il fianco portando il gomito indietro e in alto"],
      eccentric: ["Distendi il braccio lentamente fino allo stretch completo"],
      commonMistakes: ["Ruotare il busto per aiutare la tirata", "Tirare solo con il braccio senza coinvolgere la scapola"],
    },
    muscleMap: { primary: ["gran-dorsale", "romboidi"], secondary: ["bicipite-brachiale"] },
  },
  {
    id: "pulley-presa-stretta", name: "Pulley presa stretta", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "cavi",
    instructions: {
      setup: ["Usa la maniglia a V, siediti con ginocchia leggermente flesse"],
      concentric: ["Tira la maniglia verso l'addome tenendo i gomiti vicini al busto"],
      eccentric: ["Ritorna in avanti controllando il movimento fino allo stretch"],
      commonMistakes: ["Inarcare eccessivamente la schiena a fine tirata", "Usare lo slancio del busto"],
    },
    muscleMap: { primary: ["gran-dorsale"], secondary: ["bicipite-brachiale", "romboidi"] },
  },
  {
    id: "pull-over", name: "Pull-over con manubrio", primaryMuscle: "schiena", secondaryMuscles: ["petto"], equipment: "manubri",
    instructions: {
      setup: ["Sdraiati trasversalmente su una panca con solo le spalle appoggiate, manubrio sopra il petto a braccia tese"],
      concentric: ["Porta il manubrio dall'alto verso il petto mantenendo una leggera flessione dei gomiti"],
      eccentric: ["Abbassa il manubrio dietro la testa fino allo stretch del gran dorsale"],
      commonMistakes: ["Flettere troppo i gomiti (diventa un esercizio per tricipiti)", "Bacino che scende troppo perdendo la tensione addominale"],
    },
    muscleMap: { primary: ["gran-dorsale"], secondary: ["pettorale-inferiore"] },
  },
  {
    id: "lat-machine-presa-inversa", name: "Lat machine presa inversa", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "macchina",
    instructions: {
      setup: ["Afferra il bilanciere con presa supina, larghezza spalle"],
      concentric: ["Tira il bilanciere verso il petto alto portando i gomiti verso il basso e indietro"],
      eccentric: ["Distendi le braccia lentamente fino allo stretch completo"],
      commonMistakes: ["Usare troppo i bicipiti trascurando la tirata scapolare", "Slancio del busto all'indietro"],
    },
    muscleMap: { primary: ["gran-dorsale"], secondary: ["bicipite-brachiale"] },
  },
  {
    id: "rematore-cavo-seduto-largo", name: "Rematore al cavo seduto presa larga", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "cavi",
    instructions: {
      setup: ["Usa la barra larga, siediti con ginocchia leggermente flesse e schiena eretta"],
      concentric: ["Tira la barra verso il petto aprendo i gomiti lateralmente per coinvolgere il trapezio medio"],
      eccentric: ["Ritorna in avanti controllando il movimento senza arrotondare la schiena"],
      commonMistakes: ["Tirare con i gomiti stretti (sposta il lavoro sul dorsale)", "Dondolare il busto"],
    },
    muscleMap: { primary: ["trapezio-medio", "romboidi"], secondary: ["gran-dorsale", "deltoide-posteriore"] },
  },

  // ============ SPALLE ============
  {
    id: "military-press", name: "Military press", primaryMuscle: "spalle", secondaryMuscles: ["tricipiti"], equipment: "bilanciere",
    instructions: {
      setup: ["In piedi, bilanciere all'altezza delle clavicole, presa poco più larga delle spalle"],
      concentric: ["Spingi il bilanciere sopra la testa fino a braccia tese, contraendo i glutei"],
      eccentric: ["Abbassa il bilanciere in modo controllato fino alle clavicole"],
      commonMistakes: ["Inarcare eccessivamente la schiena bassa", "Spingere il bilanciere in avanti anziché verticalmente"],
    },
    muscleMap: { primary: ["deltoide-anteriore"], secondary: ["tricipite-capo-laterale", "deltoide-laterale"] },
  },
  {
    id: "arnold-press", name: "Arnold press", primaryMuscle: "spalle", secondaryMuscles: ["tricipiti"], equipment: "manubri",
    instructions: {
      setup: ["Seduto, manubri davanti alle spalle con palmi rivolti verso di te"],
      concentric: ["Spingi verso l'alto ruotando i polsi finché i palmi non sono rivolti in avanti a fine movimento"],
      eccentric: ["Abbassa i manubri ruotando i polsi nel verso opposto fino alla posizione di partenza"],
      commonMistakes: ["Rotazione del polso non sincronizzata con la spinta", "Inarcare la schiena per completare la spinta"],
    },
    muscleMap: { primary: ["deltoide-anteriore", "deltoide-laterale"], secondary: ["tricipite-capo-laterale"] },
  },
  {
    id: "alzate-laterali", name: "Alzate laterali", primaryMuscle: "spalle", secondaryMuscles: [], equipment: "manubri",
    instructions: {
      setup: ["In piedi, manubri lungo i fianchi, leggera flessione dei gomiti"],
      concentric: ["Solleva i manubri lateralmente fino all'altezza delle spalle"],
      eccentric: ["Abbassa i manubri in modo controllato senza farli oscillare"],
      commonMistakes: ["Usare lo slancio del busto", "Sollevare oltre l'altezza delle spalle coinvolgendo il trapezio"],
    },
    muscleMap: { primary: ["deltoide-laterale"], secondary: [] },
  },
  {
    id: "alzate-frontali", name: "Alzate frontali", primaryMuscle: "spalle", secondaryMuscles: [], equipment: "manubri",
    instructions: {
      setup: ["In piedi, manubri davanti alle cosce, presa neutra o prona"],
      concentric: ["Solleva un manubrio (o entrambi) frontalmente fino all'altezza delle spalle"],
      eccentric: ["Abbassa in modo controllato fino alla posizione di partenza"],
      commonMistakes: ["Usare lo slancio della schiena", "Sollevare troppo in alto oltre le spalle"],
    },
    muscleMap: { primary: ["deltoide-anteriore"], secondary: [] },
  },
  {
    id: "face-pull", name: "Face pull ai cavi", primaryMuscle: "spalle", secondaryMuscles: ["schiena"], equipment: "cavi",
    instructions: {
      setup: ["Puleggia all'altezza del volto, afferra la corda con presa neutra"],
      concentric: ["Tira la corda verso il viso separando le mani ed extraruotando le spalle"],
      eccentric: ["Ritorna alla posizione di partenza controllando il movimento"],
      commonMistakes: ["Tirare con i gomiti bassi (diventa un rematore)", "Usare carichi eccessivi perdendo la rotazione esterna"],
    },
    muscleMap: { primary: ["deltoide-posteriore"], secondary: ["trapezio-medio", "romboidi"] },
  },
  {
    id: "shoulder-press-macchina", name: "Shoulder press alla macchina", primaryMuscle: "spalle", secondaryMuscles: ["tricipiti"], equipment: "macchina",
    instructions: {
      setup: ["Regola il sedile in modo che le maniglie siano all'altezza delle spalle"],
      concentric: ["Spingi le maniglie verso l'alto fino a quasi estendere le braccia"],
      eccentric: ["Abbassa lentamente fino alla posizione di partenza"],
      commonMistakes: ["Sedile troppo basso o troppo alto", "Bloccare i gomiti con forza a fine spinta"],
    },
    muscleMap: { primary: ["deltoide-anteriore"], secondary: ["tricipite-capo-laterale"] },
  },
  {
    id: "alzate-laterali-cavo", name: "Alzate laterali al cavo", primaryMuscle: "spalle", secondaryMuscles: [], equipment: "cavi",
    instructions: {
      setup: ["Puleggia bassa al fianco, afferra la maniglia con il braccio opposto al cavo"],
      concentric: ["Solleva il braccio lateralmente fino all'altezza della spalla"],
      eccentric: ["Abbassa in modo controllato mantenendo tensione costante sul cavo"],
      commonMistakes: ["Inclinare il busto per aiutare il sollevamento", "Slancio anziché controllo muscolare"],
    },
    muscleMap: { primary: ["deltoide-laterale"], secondary: [] },
  },
  {
    id: "upright-row", name: "Tirate al mento (upright row)", primaryMuscle: "spalle", secondaryMuscles: ["schiena"], equipment: "bilanciere",
    instructions: {
      setup: ["In piedi, bilanciere davanti alle cosce, presa stretta prona"],
      concentric: ["Tira il bilanciere verso il mento portando i gomiti in alto e verso l'esterno"],
      eccentric: ["Abbassa il bilanciere in modo controllato fino alle cosce"],
      commonMistakes: ["Sollevare i gomiti oltre le spalle (rischio di impingement)", "Usare lo slancio della schiena"],
    },
    muscleMap: { primary: ["deltoide-laterale"], secondary: ["trapezio-medio"] },
  },
  {
    id: "reverse-fly-manubri", name: "Reverse fly con manubri", primaryMuscle: "spalle", secondaryMuscles: ["schiena"], equipment: "manubri",
    instructions: {
      setup: ["Busto inclinato in avanti a circa 90°, manubri sotto le spalle con leggera flessione dei gomiti"],
      concentric: ["Apri le braccia lateralmente fino all'altezza delle spalle contraendo le scapole"],
      eccentric: ["Abbassa i manubri in modo controllato fino alla posizione di partenza"],
      commonMistakes: ["Raddrizzare il busto durante il movimento", "Usare lo slancio anziché la contrazione scapolare"],
    },
    muscleMap: { primary: ["deltoide-posteriore"], secondary: ["romboidi", "trapezio-medio"] },
  },

  // ============ BICIPITI ============
  {
    id: "curl-bilanciere", name: "Curl con bilanciere", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "bilanciere",
    instructions: {
      setup: ["In piedi, bilanciere impugnato con presa supina larghezza spalle, gomiti vicini al busto"],
      concentric: ["Fletti i gomiti sollevando il bilanciere verso il petto"],
      eccentric: ["Distendi le braccia in modo controllato fino all'estensione completa"],
      commonMistakes: ["Usare lo slancio della schiena (swing)", "Gomiti che si spostano in avanti durante la salita"],
    },
    muscleMap: { primary: ["bicipite-brachiale"], secondary: ["avambraccio"] },
  },
  {
    id: "curl-manubri", name: "Curl alternato con manubri", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "manubri",
    instructions: {
      setup: ["In piedi, un manubrio per mano, braccia lungo i fianchi con presa neutra"],
      concentric: ["Fletti un gomito ruotando il polso verso la posizione supina mentre sali"],
      eccentric: ["Distendi il braccio ruotando il polso verso la posizione neutra"],
      commonMistakes: ["Dondolare il busto per aiutare la salita", "Gomito che si allontana dal busto"],
    },
    muscleMap: { primary: ["bicipite-brachiale"], secondary: ["avambraccio"] },
  },
  {
    id: "hammer-curl", name: "Hammer curl", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "manubri",
    instructions: {
      setup: ["In piedi, manubri con presa neutra (a martello), braccia lungo i fianchi"],
      concentric: ["Fletti i gomiti sollevando i manubri mantenendo la presa neutra per tutto il movimento"],
      eccentric: ["Distendi le braccia in modo controllato"],
      commonMistakes: ["Ruotare il polso durante la salita", "Usare lo slancio delle spalle"],
    },
    muscleMap: { primary: ["brachiale"], secondary: ["avambraccio", "bicipite-brachiale"] },
  },
  {
    id: "curl-cavo", name: "Curl al cavo basso", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "cavi",
    instructions: {
      setup: ["In piedi davanti alla puleggia bassa, afferra la barra con presa supina"],
      concentric: ["Fletti i gomiti sollevando la barra verso il petto mantenendo i gomiti fermi"],
      eccentric: ["Distendi le braccia in modo controllato mantenendo tensione sul cavo"],
      commonMistakes: ["Allontanarsi troppo dalla puleggia perdendo la traiettoria corretta", "Slancio del busto"],
    },
    muscleMap: { primary: ["bicipite-brachiale"], secondary: ["avambraccio"] },
  },
  {
    id: "curl-concentrato", name: "Curl concentrato", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "manubri",
    instructions: {
      setup: ["Seduto, gomito appoggiato all'interno coscia, manubrio in mano con presa supina"],
      concentric: ["Fletti il gomito sollevando il manubrio verso la spalla, isolando il bicipite"],
      eccentric: ["Distendi il braccio lentamente fino all'estensione completa"],
      commonMistakes: ["Muovere la spalla per aiutare la risalita", "Non completare l'estensione in basso"],
    },
    muscleMap: { primary: ["bicipite-brachiale"], secondary: [] },
  },
  {
    id: "curl-panca-scott", name: "Curl alla panca Scott", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "bilanciere",
    instructions: {
      setup: ["Siediti alla panca Scott con le braccia appoggiate al supporto inclinato, presa supina sul bilanciere"],
      concentric: ["Fletti i gomiti sollevando il bilanciere mantenendo i tricipiti a contatto con il supporto"],
      eccentric: ["Distendi le braccia in modo controllato fino quasi all'estensione completa"],
      commonMistakes: ["Sollevare i tricipiti dal supporto durante la salita", "Estendere completamente bloccando il gomito"],
    },
    muscleMap: { primary: ["bicipite-brachiale"], secondary: ["brachiale"] },
  },
  {
    id: "curl-cavo-alto", name: "Curl al cavo alto (incrocio)", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "cavi",
    instructions: {
      setup: ["Pulegge alte su entrambi i lati, afferra le maniglie con le braccia estese lateralmente"],
      concentric: ["Fletti i gomiti portando le mani verso la testa mantenendo i gomiti alti e fermi"],
      eccentric: ["Distendi le braccia in modo controllato mantenendo tensione sul cavo"],
      commonMistakes: ["Abbassare i gomiti durante il movimento", "Usare lo slancio del busto"],
    },
    muscleMap: { primary: ["bicipite-brachiale"], secondary: [] },
  },

  // ============ TRICIPITI ============
  {
    id: "french-press", name: "French press", primaryMuscle: "tricipiti", secondaryMuscles: [], equipment: "bilanciere",
    instructions: {
      setup: ["Sdraiato sulla panca, bilanciere (EZ o dritto) sopra il petto a braccia tese"],
      concentric: ["Estendi i gomiti riportando il bilanciere sopra il petto"],
      eccentric: ["Fletti i gomiti abbassando il bilanciere verso la fronte, mantenendo i gomiti fermi"],
      commonMistakes: ["Aprire i gomiti durante la discesa", "Muovere le spalle anziché isolare i gomiti"],
    },
    muscleMap: { primary: ["tricipite-capo-lungo"], secondary: ["tricipite-capo-mediale"] },
  },
  {
    id: "pushdown-cavo", name: "Pushdown ai cavi", primaryMuscle: "tricipiti", secondaryMuscles: [], equipment: "cavi",
    instructions: {
      setup: ["In piedi davanti alla puleggia alta, afferra la barra con presa prona, gomiti vicini al busto"],
      concentric: ["Estendi i gomiti spingendo la barra verso il basso"],
      eccentric: ["Fletti i gomiti risalendo in modo controllato mantenendoli fermi lungo il busto"],
      commonMistakes: ["Gomiti che si allontanano dal busto", "Usare il peso del busto per spingere"],
    },
    muscleMap: { primary: ["tricipite-capo-laterale"], secondary: ["tricipite-capo-mediale"] },
  },
  {
    id: "estensioni-manubrio", name: "Estensioni sopra la testa con manubrio", primaryMuscle: "tricipiti", secondaryMuscles: [], equipment: "manubri",
    instructions: {
      setup: ["Seduto o in piedi, manubrio afferrato con entrambe le mani sopra la testa, braccia tese"],
      concentric: ["Estendi i gomiti riportando il manubrio sopra la testa"],
      eccentric: ["Fletti i gomiti abbassando il manubrio dietro la nuca mantenendo i gomiti fermi"],
      commonMistakes: ["Aprire eccessivamente i gomiti", "Inarcare la schiena bassa"],
    },
    muscleMap: { primary: ["tricipite-capo-lungo"], secondary: [] },
  },
  {
    id: "kickback-manubrio", name: "Kickback con manubrio", primaryMuscle: "tricipiti", secondaryMuscles: [], equipment: "manubri",
    instructions: {
      setup: ["Busto inclinato in avanti, braccio superiore parallelo al suolo, gomito flesso a 90°"],
      concentric: ["Estendi il gomito portando il manubrio indietro fino all'estensione completa"],
      eccentric: ["Fletti il gomito tornando alla posizione di partenza mantenendo il braccio superiore fermo"],
      commonMistakes: ["Muovere il braccio superiore durante l'estensione", "Usare carichi troppo pesanti perdendo la forma"],
    },
    muscleMap: { primary: ["tricipite-capo-laterale"], secondary: [] },
  },
  {
    id: "dip-panca", name: "Dip su panca (bench dip)", primaryMuscle: "tricipiti", secondaryMuscles: ["spalle"], equipment: "corpo-libero",
    instructions: {
      setup: ["Mani su una panca dietro il bacino, gambe distese in avanti, bacino appena davanti alla panca"],
      concentric: ["Spingi verso l'alto estendendo i gomiti"],
      eccentric: ["Scendi flettendo i gomiti fino a circa 90°"],
      commonMistakes: ["Scendere troppo in profondità stressando le spalle", "Allontanare troppo il bacino dalla panca"],
    },
    muscleMap: { primary: ["tricipite-capo-laterale"], secondary: ["deltoide-anteriore"] },
  },
  {
    id: "panca-stretta", name: "Panca piana presa stretta", primaryMuscle: "tricipiti", secondaryMuscles: ["petto"], equipment: "bilanciere",
    instructions: {
      setup: ["Sdraiato sulla panca, presa sul bilanciere larghezza spalle o leggermente più stretta"],
      concentric: ["Spingi il bilanciere verso l'alto mantenendo i gomiti vicini al busto"],
      eccentric: ["Abbassa il bilanciere verso il petto basso controllando il movimento"],
      commonMistakes: ["Presa troppo stretta che stressa i polsi", "Gomiti che si aprono verso l'esterno"],
    },
    muscleMap: { primary: ["tricipite-capo-laterale", "tricipite-capo-mediale"], secondary: ["pettorale-medio"] },
  },

  // ============ QUADRICIPITI ============
  {
    id: "squat", name: "Squat con bilanciere", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei", "femorali", "core"], equipment: "bilanciere",
    instructions: {
      setup: ["Bilanciere sui trapezi, piedi larghezza spalle, punte leggermente extraruotate"],
      concentric: ["Spingi con i talloni risalendo fino all'estensione completa di anche e ginocchia"],
      eccentric: ["Scendi flettendo anche e ginocchia mantenendo il petto alto e la schiena neutra"],
      commonMistakes: ["Ginocchia che collassano verso l'interno", "Talloni che si sollevano da terra"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale", "quadricipite-vasti"], secondary: ["gluteo-massimo", "core-profondo"] },
  },
  {
    id: "leg-press", name: "Leg press", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei"], equipment: "macchina",
    instructions: {
      setup: ["Siediti con la schiena aderente allo schienale, piedi larghezza spalle sulla pedana"],
      concentric: ["Spingi la pedana estendendo le gambe senza bloccare completamente le ginocchia"],
      eccentric: ["Fletti le ginocchia abbassando la pedana in modo controllato"],
      commonMistakes: ["Sollevare il bacino dallo schienale a fine discesa", "Bloccare le ginocchia con forza a fine spinta"],
    },
    muscleMap: { primary: ["quadricipite-vasti"], secondary: ["gluteo-massimo"] },
  },
  {
    id: "affondi", name: "Affondi con manubri", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei"], equipment: "manubri",
    instructions: {
      setup: ["In piedi, un manubrio per mano lungo i fianchi"],
      concentric: ["Spingi con la gamba avanti risalendo alla posizione eretta"],
      eccentric: ["Fai un passo avanti e scendi flettendo entrambe le ginocchia fino a circa 90°"],
      commonMistakes: ["Ginocchio anteriore che supera troppo la punta del piede", "Busto inclinato in avanti"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale"], secondary: ["gluteo-massimo"] },
  },
  {
    id: "leg-extension", name: "Leg extension", primaryMuscle: "quadricipiti", secondaryMuscles: [], equipment: "macchina",
    instructions: {
      setup: ["Siediti con schiena aderente allo schienale, caviglie sotto il rullo imbottito"],
      concentric: ["Estendi le ginocchia sollevando il rullo fino quasi alla distensione completa"],
      eccentric: ["Fletti le ginocchia abbassando il rullo in modo controllato"],
      commonMistakes: ["Slancio con il busto", "Bloccare le ginocchia con forza a fine estensione"],
    },
    muscleMap: { primary: ["quadricipite-vasti"], secondary: [] },
  },
  {
    id: "front-squat", name: "Front squat", primaryMuscle: "quadricipiti", secondaryMuscles: ["core", "glutei"], equipment: "bilanciere",
    instructions: {
      setup: ["Bilanciere appoggiato sui deltoidi anteriori, gomiti alti, presa a scaffale o incrociata"],
      concentric: ["Spingi con i talloni risalendo mantenendo il busto verticale"],
      eccentric: ["Scendi flettendo anche e ginocchia mantenendo i gomiti alti e il busto eretto"],
      commonMistakes: ["Gomiti che scendono facendo cadere il bilanciere", "Busto che si inclina troppo in avanti"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale", "quadricipite-vasti"], secondary: ["core-profondo", "gluteo-massimo"] },
  },
  {
    id: "hack-squat", name: "Hack squat alla macchina", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei"], equipment: "macchina",
    instructions: {
      setup: ["Schiena e spalle aderenti al supporto, piedi larghezza spalle sulla pedana"],
      concentric: ["Spingi la pedana estendendo le gambe senza bloccare completamente le ginocchia"],
      eccentric: ["Fletti le ginocchia scendendo in modo controllato"],
      commonMistakes: ["Scendere oltre il range confortevole sollevando il bacino", "Piedi troppo in alto sulla pedana"],
    },
    muscleMap: { primary: ["quadricipite-vasti"], secondary: ["gluteo-massimo"] },
  },
  {
    id: "bulgarian-split-squat", name: "Bulgarian split squat", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei"], equipment: "manubri",
    instructions: {
      setup: ["Piede posteriore appoggiato su una panca dietro di te, manubri lungo i fianchi"],
      concentric: ["Spingi con la gamba anteriore risalendo alla posizione eretta"],
      eccentric: ["Scendi flettendo il ginocchio anteriore fino a circa 90°"],
      commonMistakes: ["Ginocchio anteriore che va oltre la punta del piede in modo instabile", "Busto troppo inclinato in avanti"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale"], secondary: ["gluteo-massimo"] },
  },
  {
    id: "step-up", name: "Step-up con manubri", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei"], equipment: "manubri",
    instructions: {
      setup: ["In piedi davanti a un rialzo stabile, manubri lungo i fianchi"],
      concentric: ["Sali sul rialzo spingendo con la gamba appoggiata fino all'estensione completa"],
      eccentric: ["Scendi in modo controllato con la stessa gamba"],
      commonMistakes: ["Spingere con la gamba a terra anziché con quella sul rialzo", "Rialzo troppo alto che compromette la forma"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale"], secondary: ["gluteo-massimo"] },
  },
  {
    id: "squat-goblet", name: "Squat goblet", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei", "core"], equipment: "kettlebell",
    instructions: {
      setup: ["Tieni il kettlebell verticale davanti al petto con entrambe le mani, piedi larghezza spalle"],
      concentric: ["Spingi con i talloni risalendo fino all'estensione completa"],
      eccentric: ["Scendi tra le ginocchia mantenendo i gomiti dentro le cosce a fine discesa"],
      commonMistakes: ["Busto che si inclina in avanti", "Talloni che si sollevano da terra"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale", "quadricipite-vasti"], secondary: ["gluteo-massimo", "core-profondo"] },
  },

  // ============ FEMORALI ============
  {
    id: "stacchi-rumeni", name: "Stacchi rumeni", primaryMuscle: "femorali", secondaryMuscles: ["glutei", "schiena"], equipment: "bilanciere",
    instructions: {
      setup: ["In piedi, bilanciere davanti alle cosce, presa prona larghezza spalle"],
      concentric: ["Spingi le anche in avanti risalendo alla posizione eretta"],
      eccentric: ["Spingi le anche indietro abbassando il bilanciere lungo le gambe, ginocchia poco flesse"],
      commonMistakes: ["Arrotondare la schiena bassa", "Piegare troppo le ginocchia trasformandolo in uno squat"],
    },
    muscleMap: { primary: ["femorale-bicipite", "femorale-semitendinoso"], secondary: ["gluteo-massimo", "lombari"] },
  },
  {
    id: "leg-curl", name: "Leg curl", primaryMuscle: "femorali", secondaryMuscles: [], equipment: "macchina",
    instructions: {
      setup: ["Sdraiato prono sulla macchina, caviglie sotto il rullo imbottito"],
      concentric: ["Fletti le ginocchia portando i talloni verso i glutei"],
      eccentric: ["Estendi le ginocchia abbassando il rullo in modo controllato"],
      commonMistakes: ["Sollevare il bacino dalla panca", "Slancio a inizio movimento"],
    },
    muscleMap: { primary: ["femorale-bicipite"], secondary: ["femorale-semitendinoso"] },
  },
  {
    id: "good-morning", name: "Good morning", primaryMuscle: "femorali", secondaryMuscles: ["schiena", "glutei"], equipment: "bilanciere",
    instructions: {
      setup: ["Bilanciere sui trapezi come in uno squat, piedi larghezza spalle, ginocchia poco flesse"],
      concentric: ["Spingi le anche in avanti risalendo alla posizione eretta"],
      eccentric: ["Piega il busto in avanti spingendo le anche indietro, schiena neutra"],
      commonMistakes: ["Arrotondare la schiena bassa", "Flettere troppo le ginocchia"],
    },
    muscleMap: { primary: ["femorale-bicipite"], secondary: ["lombari", "gluteo-massimo"] },
  },
  {
    id: "nordic-curl", name: "Nordic curl", primaryMuscle: "femorali", secondaryMuscles: ["glutei"], equipment: "corpo-libero",
    instructions: {
      setup: ["In ginocchio, caviglie bloccate saldamente (da un partner o un supporto)"],
      concentric: ["Usando la forza dei femorali, tirati indietro verso la posizione di partenza"],
      eccentric: ["Scendi in avanti il più lentamente possibile controllando il movimento con i femorali"],
      commonMistakes: ["Piegarsi dalle anche invece che dalle ginocchia", "Scendere in modo incontrollato"],
    },
    muscleMap: { primary: ["femorale-bicipite", "femorale-semitendinoso"], secondary: ["gluteo-massimo"] },
  },
  {
    id: "stacchi-gamba-singola", name: "Stacchi rumeni a gamba singola", primaryMuscle: "femorali", secondaryMuscles: ["glutei"], equipment: "manubri",
    instructions: {
      setup: ["In piedi su una gamba, manubrio nella mano opposta, leggera flessione del ginocchio d'appoggio"],
      concentric: ["Risali portando il busto in verticale ed estendendo l'anca"],
      eccentric: ["Piega il busto in avanti sollevando la gamba libera indietro, schiena neutra"],
      commonMistakes: ["Perdere l'equilibrio ruotando il bacino", "Arrotondare la schiena bassa"],
    },
    muscleMap: { primary: ["femorale-bicipite"], secondary: ["gluteo-massimo", "gluteo-medio"] },
  },
  {
    id: "leg-curl-in-piedi", name: "Leg curl in piedi", primaryMuscle: "femorali", secondaryMuscles: [], equipment: "macchina",
    instructions: {
      setup: ["In piedi, caviglia agganciata al rullo imbottito della macchina"],
      concentric: ["Fletti il ginocchio portando il tallone verso il gluteo"],
      eccentric: ["Estendi il ginocchio abbassando il rullo in modo controllato"],
      commonMistakes: ["Inclinare eccessivamente il busto in avanti", "Slancio del bacino"],
    },
    muscleMap: { primary: ["femorale-bicipite"], secondary: ["femorale-semitendinoso"] },
  },

  // ============ GLUTEI ============
  {
    id: "hip-thrust", name: "Hip thrust", primaryMuscle: "glutei", secondaryMuscles: ["femorali"], equipment: "bilanciere",
    instructions: {
      setup: ["Schiena appoggiata a una panca, bilanciere sul bacino, piedi larghezza spalle"],
      concentric: ["Spingi le anche verso l'alto contraendo i glutei fino all'estensione completa"],
      eccentric: ["Abbassa il bacino in modo controllato senza toccare terra"],
      commonMistakes: ["Iperestendere la schiena bassa a fine movimento", "Piedi troppo lontani o vicini al bacino"],
    },
    muscleMap: { primary: ["gluteo-massimo"], secondary: ["femorale-bicipite"] },
  },
  {
    id: "glute-bridge", name: "Glute bridge", primaryMuscle: "glutei", secondaryMuscles: ["femorali"], equipment: "corpo-libero",
    instructions: {
      setup: ["Sdraiato supino, ginocchia flesse, piedi a terra larghezza bacino"],
      concentric: ["Spingi le anche verso l'alto contraendo i glutei"],
      eccentric: ["Abbassa il bacino in modo controllato verso terra"],
      commonMistakes: ["Spingere con la schiena anziché con i glutei", "Range di movimento ridotto"],
    },
    muscleMap: { primary: ["gluteo-massimo"], secondary: ["femorale-bicipite"] },
  },
  {
    id: "hip-thrust-monopodalico", name: "Hip thrust monopodalico", primaryMuscle: "glutei", secondaryMuscles: ["femorali"], equipment: "corpo-libero",
    instructions: {
      setup: ["Schiena appoggiata a una panca, un piede a terra e l'altra gamba sollevata"],
      concentric: ["Spingi con la gamba a terra sollevando le anche fino all'estensione completa"],
      eccentric: ["Abbassa il bacino in modo controllato mantenendo l'equilibrio"],
      commonMistakes: ["Ruotare il bacino verso il lato non appoggiato", "Iperestendere la schiena bassa"],
    },
    muscleMap: { primary: ["gluteo-massimo"], secondary: ["femorale-bicipite"] },
  },
  {
    id: "abduttore-macchina", name: "Abduttore alla macchina", primaryMuscle: "glutei", secondaryMuscles: [], equipment: "macchina",
    instructions: {
      setup: ["Siediti con la schiena aderente allo schienale, esterno cosce contro i cuscinetti"],
      concentric: ["Apri le gambe lateralmente contro la resistenza"],
      eccentric: ["Richiudi le gambe in modo controllato"],
      commonMistakes: ["Usare lo slancio del busto", "Range di movimento eccessivo che scarica la tensione"],
    },
    muscleMap: { primary: ["gluteo-medio"], secondary: [] },
  },
  {
    id: "kickback-cavo-glutei", name: "Kickback ai cavi (glutei)", primaryMuscle: "glutei", secondaryMuscles: [], equipment: "cavi",
    instructions: {
      setup: ["Cavigliera agganciata alla puleggia bassa, busto leggermente inclinato in avanti con appoggio"],
      concentric: ["Spingi la gamba indietro ed estendi l'anca contraendo il gluteo"],
      eccentric: ["Riporta la gamba in avanti in modo controllato"],
      commonMistakes: ["Inarcare la schiena bassa per aumentare il range", "Usare slancio anziché contrazione controllata"],
    },
    muscleMap: { primary: ["gluteo-massimo"], secondary: ["gluteo-medio"] },
  },

  // ============ POLPACCI ============
  {
    id: "calf-raise", name: "Calf raise in piedi", primaryMuscle: "polpacci", secondaryMuscles: [], equipment: "macchina",
    instructions: {
      setup: ["In piedi sulla macchina con le spalle sotto i supporti, punte dei piedi sul bordo della pedana"],
      concentric: ["Spingi sulle punte sollevando i talloni il più possibile"],
      eccentric: ["Abbassa i talloni lentamente fino allo stretch completo"],
      commonMistakes: ["Rimbalzare senza controllo", "Range di movimento parziale"],
    },
    muscleMap: { primary: ["gastrocnemio"], secondary: ["soleo"] },
  },
  {
    id: "calf-raise-seduto", name: "Calf raise da seduto", primaryMuscle: "polpacci", secondaryMuscles: [], equipment: "macchina",
    instructions: {
      setup: ["Seduto con le ginocchia sotto il supporto imbottito, punte dei piedi sulla pedana"],
      concentric: ["Spingi sulle punte sollevando i talloni contraendo i polpacci"],
      eccentric: ["Abbassa i talloni lentamente fino allo stretch completo"],
      commonMistakes: ["Range di movimento parziale", "Movimento troppo rapido senza controllo"],
    },
    muscleMap: { primary: ["soleo"], secondary: ["gastrocnemio"] },
  },
  {
    id: "calf-raise-leg-press", name: "Calf raise alla leg press", primaryMuscle: "polpacci", secondaryMuscles: [], equipment: "macchina",
    instructions: {
      setup: ["Seduto alla leg press, solo le punte dei piedi sul bordo inferiore della pedana, gambe quasi estese"],
      concentric: ["Spingi con le punte estendendo le caviglie"],
      eccentric: ["Lascia flettere le caviglie abbassando la pedana fino allo stretch completo"],
      commonMistakes: ["Flettere troppo le ginocchia trasformandolo in un altro esercizio", "Rimbalzare senza controllo"],
    },
    muscleMap: { primary: ["gastrocnemio"], secondary: ["soleo"] },
  },

  // ============ CORE ============
  {
    id: "plank", name: "Plank", primaryMuscle: "core", secondaryMuscles: [], equipment: "corpo-libero",
    instructions: {
      setup: ["Avambracci a terra sotto le spalle, corpo in linea retta dai talloni alla testa"],
      concentric: ["Mantieni la posizione contraendo addome e glutei"],
      eccentric: ["Non applicabile: esercizio isometrico, mantenere la tensione per tutta la durata"],
      commonMistakes: ["Bacino che cede verso il basso", "Alzare troppo il bacino perdendo la linea retta"],
    },
    muscleMap: { primary: ["core-profondo"], secondary: ["retto-addominale"] },
  },
  {
    id: "crunch", name: "Crunch a terra", primaryMuscle: "core", secondaryMuscles: [], equipment: "corpo-libero",
    instructions: {
      setup: ["Sdraiato supino, ginocchia flesse, piedi a terra, mani dietro la testa senza tirare il collo"],
      concentric: ["Solleva le scapole da terra flettendo la colonna toracica"],
      eccentric: ["Riabbassa il busto in modo controllato senza toccare completamente terra"],
      commonMistakes: ["Tirare il collo con le mani", "Usare lo slancio anziché la contrazione addominale"],
    },
    muscleMap: { primary: ["retto-addominale"], secondary: [] },
  },
  {
    id: "hanging-leg-raise", name: "Sollevamento gambe alla sbarra", primaryMuscle: "core", secondaryMuscles: [], equipment: "corpo-libero",
    instructions: {
      setup: ["Appeso alla sbarra con presa prona, braccia tese, corpo disteso"],
      concentric: ["Solleva le gambe (o le ginocchia) verso il petto contraendo l'addome"],
      eccentric: ["Abbassa le gambe in modo controllato senza dondolare"],
      commonMistakes: ["Usare lo slancio del corpo (kipping)", "Non completare la fase eccentrica in modo controllato"],
    },
    muscleMap: { primary: ["retto-addominale"], secondary: ["core-profondo"] },
  },
  {
    id: "mountain-climber", name: "Mountain climber", primaryMuscle: "core", secondaryMuscles: ["quadricipiti"], equipment: "corpo-libero",
    instructions: {
      setup: ["Posizione di plank alto, mani sotto le spalle, corpo in linea retta"],
      concentric: ["Porta alternativamente un ginocchio verso il petto in modo rapido e controllato"],
      eccentric: ["Riporta la gamba indietro nella posizione di plank"],
      commonMistakes: ["Bacino che sale troppo in alto", "Perdere la linea retta del busto"],
    },
    muscleMap: { primary: ["core-profondo"], secondary: ["quadricipite-retto-femorale"] },
  },
  {
    id: "russian-twist", name: "Russian twist", primaryMuscle: "core", secondaryMuscles: [], equipment: "corpo-libero",
    instructions: {
      setup: ["Seduto con busto inclinato indietro a circa 45°, ginocchia flesse, piedi sollevati o a terra"],
      concentric: ["Ruota il busto da un lato portando le mani (o un peso) accanto al fianco"],
      eccentric: ["Ruota verso il lato opposto passando per il centro in modo controllato"],
      commonMistakes: ["Muovere solo le braccia senza ruotare il busto", "Schiena troppo arrotondata"],
    },
    muscleMap: { primary: ["obliqui"], secondary: ["retto-addominale"] },
  },
  {
    id: "ab-wheel-rollout", name: "Ab wheel rollout", primaryMuscle: "core", secondaryMuscles: ["spalle"], equipment: "corpo-libero",
    instructions: {
      setup: ["In ginocchio, mani sulla ruota davanti a te, addome contratto"],
      concentric: ["Tirati indietro con l'addome riportando la ruota verso le ginocchia"],
      eccentric: ["Fai rotolare la ruota in avanti mantenendo il core contratto e la schiena neutra"],
      commonMistakes: ["Inarcare la schiena bassa durante l'estensione", "Spingersi troppo in avanti perdendo il controllo"],
    },
    muscleMap: { primary: ["core-profondo", "retto-addominale"], secondary: ["deltoide-anteriore"] },
  },
  {
    id: "side-plank", name: "Plank laterale", primaryMuscle: "core", secondaryMuscles: [], equipment: "corpo-libero",
    instructions: {
      setup: ["Sdraiato su un fianco, avambraccio a terra sotto la spalla, corpo in linea retta"],
      concentric: ["Solleva il bacino da terra allineando il corpo dalla testa ai piedi"],
      eccentric: ["Non applicabile: esercizio isometrico, mantenere la tensione per tutta la durata"],
      commonMistakes: ["Bacino che cede verso il basso", "Spalla non allineata sopra il gomito"],
    },
    muscleMap: { primary: ["obliqui"], secondary: ["core-profondo"] },
  },

  // ============ CARDIO ============
  {
    id: "corsa-tapis-roulant", name: "Corsa al tapis roulant", primaryMuscle: "cardio", secondaryMuscles: ["quadricipiti", "polpacci"], equipment: "macchina",
    instructions: {
      setup: ["Imposta velocità e inclinazione, postura eretta con leggera inclinazione in avanti"],
      concentric: ["Mantieni un passo regolare atterrando sull'avampiede o a tutta pianta"],
      eccentric: ["Non applicabile: movimento ciclico continuo"],
      commonMistakes: ["Aggrapparsi ai corrimano riducendo il lavoro", "Passo troppo lungo (overstriding)"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale", "gastrocnemio"], secondary: ["gluteo-massimo"] },
  },
  {
    id: "vogatore", name: "Vogatore (rowing machine)", primaryMuscle: "cardio", secondaryMuscles: ["schiena", "femorali"], equipment: "macchina",
    instructions: {
      setup: ["Piedi fissati ai pedali, afferra la maniglia con braccia tese, ginocchia flesse"],
      concentric: ["Spingi con le gambe, poi tira la maniglia verso l'addome inclinando leggermente il busto indietro"],
      eccentric: ["Distendi le braccia, inclina il busto in avanti e fletti le ginocchia tornando alla posizione di partenza"],
      commonMistakes: ["Tirare con le braccia prima di spingere con le gambe", "Schiena arrotondata durante la trazione"],
    },
    muscleMap: { primary: ["gran-dorsale", "quadricipite-retto-femorale"], secondary: ["femorale-bicipite", "trapezio-medio"] },
  },
  {
    id: "cyclette", name: "Cyclette", primaryMuscle: "cardio", secondaryMuscles: ["quadricipiti"], equipment: "macchina",
    instructions: {
      setup: ["Regola sella e manubrio, ginocchio leggermente flesso con il pedale al punto più basso"],
      concentric: ["Pedala mantenendo una cadenza regolare"],
      eccentric: ["Non applicabile: movimento ciclico continuo"],
      commonMistakes: ["Sella troppo bassa (stress sulle ginocchia)", "Ginocchia che oscillano lateralmente"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale", "quadricipite-vasti"], secondary: ["gastrocnemio"] },
  },
  {
    id: "salto-corda", name: "Salto con la corda", primaryMuscle: "cardio", secondaryMuscles: ["polpacci"], equipment: "corpo-libero",
    instructions: {
      setup: ["Corda in mano, gomiti vicini al busto, leggera flessione delle ginocchia"],
      concentric: ["Salta appena sopra il pavimento facendo passare la corda sotto i piedi"],
      eccentric: ["Atterra morbidamente sull'avampiede assorbendo l'impatto con le caviglie"],
      commonMistakes: ["Saltare troppo in alto sprecando energia", "Atterrare sui talloni"],
    },
    muscleMap: { primary: ["gastrocnemio", "soleo"], secondary: ["quadricipite-retto-femorale"] },
  },
  {
    id: "burpees", name: "Burpees", primaryMuscle: "cardio", secondaryMuscles: ["petto", "core"], equipment: "corpo-libero",
    instructions: {
      setup: ["In piedi, posizione neutra"],
      concentric: ["Da terra, spingi esplosivamente verso l'alto in un salto con le braccia sopra la testa"],
      eccentric: ["Accovacciati, porta le mani a terra, salta i piedi indietro in plank, esegui un push-up e riporta i piedi avanti"],
      commonMistakes: ["Schiena arrotondata nella fase di plank", "Atterraggio rigido dopo il salto"],
    },
    muscleMap: { primary: ["quadricipite-retto-femorale", "core-profondo"], secondary: ["pettorale-medio", "deltoide-anteriore"] },
  },
];

/** Etichette leggibili per i gruppi muscolari. */
export const muscleGroupLabels: Record<string, string> = {
  petto: "Petto",
  schiena: "Schiena",
  spalle: "Spalle",
  bicipiti: "Bicipiti",
  tricipiti: "Tricipiti",
  quadricipiti: "Quadricipiti",
  femorali: "Femorali",
  glutei: "Glutei",
  polpacci: "Polpacci",
  core: "Core",
  cardio: "Cardio",
};

export const equipmentLabels: Record<string, string> = {
  bilanciere: "Bilanciere",
  manubri: "Manubri",
  cavi: "Cavi",
  macchina: "Macchina",
  "corpo-libero": "Corpo libero",
  kettlebell: "Kettlebell",
  elastici: "Elastici",
};

/** Sessioni di default: classico Push / Pull / Legs. */
const defaultSessions: WorkoutSession[] = [
  {
    id: "sess-push",
    name: "Push — Petto, Spalle, Tricipiti",
    focus: "Petto · Spalle · Tricipiti",
    estimatedMinutes: 55,
    exercises: [
      { id: "pe1", exerciseId: "panca-piana", sets: 4, reps: 8 },
      { id: "pe2", exerciseId: "panca-inclinata", sets: 3, reps: 10 },
      { id: "pe3", exerciseId: "military-press", sets: 3, reps: 8 },
      { id: "pe4", exerciseId: "alzate-laterali", sets: 3, reps: 12 },
      { id: "pe5", exerciseId: "pushdown-cavo", sets: 3, reps: 12 },
    ],
  },
  {
    id: "sess-pull",
    name: "Pull — Schiena, Bicipiti",
    focus: "Schiena · Bicipiti",
    estimatedMinutes: 55,
    exercises: [
      { id: "pu1", exerciseId: "trazioni", sets: 4, reps: 8 },
      { id: "pu2", exerciseId: "rematore-bilanciere", sets: 4, reps: 8 },
      { id: "pu3", exerciseId: "lat-machine", sets: 3, reps: 10 },
      { id: "pu4", exerciseId: "curl-bilanciere", sets: 3, reps: 10 },
      { id: "pu5", exerciseId: "hammer-curl", sets: 3, reps: 12 },
    ],
  },
  {
    id: "sess-legs",
    name: "Legs — Gambe, Glutei",
    focus: "Quadricipiti · Femorali · Glutei",
    estimatedMinutes: 60,
    exercises: [
      { id: "le1", exerciseId: "squat", sets: 4, reps: 8 },
      { id: "le2", exerciseId: "stacchi-rumeni", sets: 4, reps: 10 },
      { id: "le3", exerciseId: "leg-press", sets: 3, reps: 12 },
      { id: "le4", exerciseId: "leg-curl", sets: 3, reps: 12 },
      { id: "le5", exerciseId: "calf-raise", sets: 4, reps: 15 },
    ],
  },
];

/**
 * Piano di default: Lun=Push, Mar=riposo, Mer=Pull, Gio=riposo,
 * Ven=Legs, Sab=riposo, Dom=riposo.
 * Indici: 0=domenica, 1=lunedì, ..., 6=sabato
 */
export const defaultWeeklyPlan: WeeklyPlan = {
  sessions: defaultSessions,
  weekMap: [
    null, // domenica
    "sess-push", // lunedì
    null, // martedì
    "sess-pull", // mercoledì
    null, // giovedì
    "sess-legs", // venerdì
    null, // sabato
  ],
};

/** Etichette giorni. */
export const dayLabels = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
export const dayLabelsShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
