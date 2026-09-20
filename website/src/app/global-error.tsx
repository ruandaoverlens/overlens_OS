"use client";

// Boundary global: substitui o root layout inteiro, por isso precisa do seu
// próprio <html>/<body>. globals.css não é carregado aqui, então os estilos
// são inline.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <title>Algo deu errado · Overlens OS</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          background: "#000",
          color: "#fff",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <main id="main-content" role="alert" style={{ maxWidth: 420, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 8px",
            }}
          >
            Algo deu errado
          </h1>
          <p style={{ fontSize: 14, opacity: 0.6, margin: "0 0 24px" }}>
            Ocorreu um erro inesperado ao carregar a aplicação. Você pode tentar
            novamente.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              cursor: "pointer",
              height: 40,
              padding: "0 24px",
              borderRadius: 9999,
              border: "none",
              background: "#fff",
              color: "#000",
              fontSize: 14,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Tentar novamente
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: 24,
                fontSize: 11,
                opacity: 0.4,
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Código: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
