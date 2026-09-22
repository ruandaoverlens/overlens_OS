"use client";

// Boundary global: substitui o root layout inteiro, por isso precisa do seu
// próprio <html>/<body>. globals.css não é carregado aqui e o next-themes não
// roda, então os dois temas são resolvidos por `prefers-color-scheme` num
// <style> inline, com variáveis próprias.
const themeCss = `
  :root {
    color-scheme: dark light;
    --ge-bg: #000;
    --ge-fg: #fff;
    --ge-dim: #9a9a9a;   /* 7,46:1 sobre #000 */
    --ge-faint: #8c8c8c; /* 6,25:1 sobre #000 */
  }
  @media (prefers-color-scheme: light) {
    :root {
      --ge-bg: #fff;
      --ge-fg: #101010;
      --ge-dim: #6b6b6b;   /* 5,33:1 sobre #fff */
      --ge-faint: #767676; /* 4,54:1 sobre #fff */
    }
  }
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Algo deu errado · Overlens OS</title>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          background: "var(--ge-bg)",
          color: "var(--ge-fg)",
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
          <p style={{ fontSize: 14, color: "var(--ge-dim)", margin: "0 0 24px" }}>
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
              // Botão é o inverso do fundo nos dois temas.
              background: "var(--ge-fg)",
              color: "var(--ge-bg)",
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
                color: "var(--ge-faint)",
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
