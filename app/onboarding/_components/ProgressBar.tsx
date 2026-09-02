/** Barra di avanzamento del wizard: 4 segmenti, nessuno stato proprio. */
export default function ProgressBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-800/70">
        Passo {step} di 4
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1.5 rounded-full ${n <= step ? "bg-emerald-600" : "bg-emerald-100"}`}
          />
        ))}
      </div>
    </div>
  );
}
