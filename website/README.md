Next.js app for Overlens. Secrets are managed via [Infisical](https://infisical.com) — there is no `.env.local`.

## Setup local

**Pré-requisitos:** Node.js 20+, conta no Infisical com acesso ao projeto `overlens-os`.

1. **Instalar o Infisical CLI**
   - Windows: `winget install infisical.infisical`
   - macOS: `brew install infisical/get-cli/infisical`
   - Linux/outros: ver https://infisical.com/docs/cli/overview

2. **Autenticar (uma vez por máquina)**
   ```bash
   infisical login
   ```
   Abre o browser, você loga, o token fica guardado no keyring do SO.

3. **Instalar deps e rodar**
   ```bash
   npm install
   npm run dev
   ```
   O script `dev` usa `infisical run --env=dev` por baixo, que injeta os segredos em memória no processo Next. Você verá `Injecting 7 Infisical secrets into your application process` na inicialização.

4. **Acessar:** http://localhost:3000

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Next em modo dev, com segredos do Infisical (env `dev`) |
| `npm run build` | Build de produção (sem wrapper — Vercel injeta env vars no build remoto) |
| `npm run build:local` | Build local com segredos do Infisical |
| `npm run start` | Roda o build local (depois de `build:local`) |
| `npm run storybook` | Storybook em dev |
| `npm run lint` | ESLint |

## Onde edito segredos

App web do Infisical → projeto `overlens-os` → ambiente correspondente (`dev`, `preview`, `production`). Mudanças sincronizam pra Vercel automaticamente em ~10s via Native Integration.

## Deploy

`main` → produção (`overlens-os.vercel.app`). Qualquer outra branch → Preview Deployment automático na Vercel. Env vars vêm da Infisical Native Integration; nada precisa ser cadastrado no dashboard Vercel manualmente.

## Scripts standalone

Rodam fora do Next (migrações, uploads, etc.). Wrappar manualmente com `infisical run`:

```bash
infisical run --env=dev -- npx tsx scripts/migrate-assets-to-storage.ts
```
