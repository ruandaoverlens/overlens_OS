# ADR-0002 — Autorização e controle de acesso por domínio/role

- **Status**: Aceito
- **Data**: 2026-07-24
- **Decisores**: Ruan Braz

## Contexto

A plataforma Overlens OS já tem mais de 1400 usuários. A regra de negócio é clara: apenas e-mails do domínio `@overlens.com.br` (mais operadores com role `staff`/`admin` de e-mail externo, enquanto a equipe não é 100% regularizada no domínio) podem acessar áreas e funcionalidades restritas — dados internos, ferramentas administrativas, páginas de insights, etc.

Uma auditoria de segurança revelou que essa regra não era realmente imposta: usuários gratuitos conseguiam acessar páginas e dados restritos simplesmente adivinhando ou navegando diretamente para URLs internas. A autorização dependia apenas de duas camadas fracas:

- o edge middleware (`website/src/proxy.ts`), que faz gate de rota — mas cobre navegação de página, não chamadas diretas à API;
- a UI, que oculta botões/links — mas ocultar não é proteger.

O banco de dados (Supabase) é compartilhado entre os ambientes de dev, preview e produção, e suas políticas de Row Level Security (RLS) permitiam leitura ampla a qualquer usuário autenticado, independentemente de domínio de e-mail ou role. Isso significa que, mesmo sem passar pelo middleware ou pela UI, uma chamada direta ao PostgREST ou ao Storage com a chave `anon` conseguia ler dados que deveriam ser restritos.

## Problema

Como impedir que usuários não autorizados acessem áreas e dados restritos da plataforma, dado que a UI e o middleware de edge são, por natureza, contornáveis, e o banco de dados compartilhado (dev/preview/produção) não pode ter suas políticas apertadas sem risco de quebrar operadores legítimos que ainda não têm e-mail `@overlens.com.br`?

## Decisão

Adotar defesa em profundidade (*defense-in-depth*) em três camadas, sendo a última — o banco — a fronteira real de segurança:

### 1. Edge middleware — gate de rota por role

`website/src/proxy.ts` resolve a role do usuário a partir do banco e bloqueia, por rota de página, o acesso de quem não tem a role exigida. Esta camada existia antes desta decisão e continua servindo como primeira barreira de UX (redirecionar cedo, sem round-trip desnecessário à API), mas deixa de ser considerada suficiente isoladamente.

### 2. Route handlers de API — revalidação server-side

Cada route handler de API revalida autenticação e role no servidor, de forma independente do middleware e da UI. Nenhuma API confia que "se chegou até aqui, o middleware já validou" — a checagem é redundante e proposital, porque o middleware pode ter brechas de rota, cache ou configuração.

### 3. RLS no Postgres — a fronteira real

A camada que efetivamente impõe a regra de negócio é o Row Level Security do Postgres. A regra "`@overlens.com.br` ou staff/admin" é centralizada em uma única função:

```sql
public.is_overlens_or_staff()
```

- `SECURITY DEFINER`, com `search_path` fixo (evita sequestro de função via search_path malicioso).
- Combina `(auth.jwt()->>'email' LIKE '%@overlens.com.br') OR role IN ('staff', 'admin')`.

As policies de `SELECT` das tabelas restritas — `ads`, `ad_media`, `asset_metadata`, `content_items`, `hidden_assets`, `mycelium_references`, `mycelium_attachments` — e do bucket de Storage `platform-assets` usam essa função como condição de acesso. Isso significa que mesmo uma chamada direta ao PostgREST ou ao Storage com a chave `anon`, contornando completamente o app, middleware e UI, é barrada no banco.

A cláusula `OR role IN ('staff', 'admin')` é deliberadamente transitória: existe apenas porque nem todos os operadores atuais têm e-mail `@overlens.com.br`. Quando a equipe estiver 100% regularizada no domínio, a função pode ser apertada para domínio puro (`@overlens.com.br` apenas) editando um único lugar — a própria função — sem tocar em nenhuma policy individual.

## Alternativas consideradas

- **Gate apenas no app/middleware**: rejeitada. Não protege contra acesso direto ao PostgREST ou ao Storage usando a chave `anon` — que qualquer cliente com acesso ao bundle do frontend consegue extrair. A regra de negócio ficaria dependente inteiramente do app, que é a camada mais fácil de contornar.
- **Gate por domínio puro (`@overlens.com.br` apenas) desde já, sem a cláusula de role**: adiada. Expulsaria imediatamente operadores staff/admin legítimos que ainda usam e-mail externo, antes de haver uma janela para regularizá-los no domínio. A cláusula `OR role` é o mecanismo de transição controlada para esse estado final.

## Consequências

**Melhora:**

- A regra de negócio (`@overlens.com.br` + staff/admin) deixa de depender do app — é imposta onde os dados realmente vivem.
- Contornar a API (chamada direta, chave `anon`, scraping de endpoint) não vaza mais dados restritos.
- Ponto único de evolução da regra: apertar de "domínio + role" para "domínio puro" é uma edição na função `is_overlens_or_staff()`, não uma varredura de policies.

**Custos e riscos assumidos:**

- O banco Supabase é compartilhado entre dev, preview e produção — qualquer mudança de policy precisa ser testada com cuidado antes de ir para produção, já que afeta os três ambientes ao mesmo tempo.
- A tabela `profiles` ainda não está no Grupo 1 de RLS (permanece com leitura ampla) — fica como trabalho derivado desta decisão, pendente de uma janela de teste dedicada antes de restringir.
- Roles (`staff`, `admin`) são atribuídas manualmente hoje; não há mapeamento automático e-mail → role, o que exige disciplina operacional para não deixar contas com role indevida.

**Passa a ser obrigatório:**

- Qualquer nova tabela ou bucket com dados restritos precisa de policy de RLS usando `is_overlens_or_staff()` (ou equivalente) — não é opcional confiar apenas em middleware/UI.
- Nenhuma API nova pode assumir que o middleware já barrou o acesso; a revalidação server-side de auth+role é parte do contrato de todo route handler.

## Critérios de sucesso

- Chamada direta ao PostgREST/Storage com a chave `anon`, sem passar pelo app, não retorna dados das tabelas/bucket restritos para um usuário sem domínio `@overlens.com.br` e sem role staff/admin.
- `profiles` e o Grupo 2 de RLS documentados como trabalho pendente, com plano de execução (não esquecido).
- Apertar a regra para domínio puro é executável editando apenas `is_overlens_or_staff()`, sem tocar em policies individuais.
