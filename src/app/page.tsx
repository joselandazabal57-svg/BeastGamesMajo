export default function Home() {
  return (
    <main className="min-h-full flex flex-col items-center justify-center px-6 gap-6 text-center">
      <div className="text-6xl" aria-hidden>🦁</div>
      <h1
        className="font-[family-name:var(--font-display)] uppercase leading-none text-6xl"
        style={{
          background: "linear-gradient(180deg, #fff, var(--color-gold))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Beast<br />Games
      </h1>
      <p className="text-(--color-gold) font-semibold tracking-[0.2em] uppercase text-xs">
        ★ Bootstrap fase 1 ★
      </p>
      <p className="opacity-60 text-sm max-w-xs">
        Si ves esto con el degradado dorado, las fuentes y la paleta cargaron correctamente.
      </p>
    </main>
  );
}
