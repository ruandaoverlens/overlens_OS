---
name: touchpoints
description: Constrói a página de Pontos de Contato mapeando todos os touchpoints da Overlens por jornada do empreendedor, com diretrizes por canal.
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /touchpoints: Construir Pontos de Contato

Execute o pipeline para a página de Pontos de Contato:

1. Lance o agente `especialista-midias`, que deve ler `.claude/rules/tese-atual.md` (normativa, prevalece sobre a base) + a base canônica em `website/content/<sistema>/` e as diretrizes de Instagram existentes
2. Produzir `[PAGINA] Pontos de Contato.md` com:
   - Mapa de touchpoints por jornada (Descoberta → Consideração → Entrada → Profundidade → Legado)
   - Diretrizes por canal (Instagram, YouTube, plataforma, e-mail, eventos, DM)
   - Tom predominante e persona sintética ativa para cada touchpoint
   - Métricas de sucesso por canal
3. Rodar revisão com agente `revisor`

**Lembrete**: o público é o **empreendedor**, que se define pelo estado, não pela profissão; nunca rotulado como "designers", "criativos" nem como "Empreendedor Nexialista". Na comunidade, o membro é um **Atom**. As jornadas são de relacionamento com a marca e NÃO correspondem aos quatro modos (Operante executa · Convergente conecta · Emergente cria · Nexialista orquestra), que são formas de agir e pensar, não estágios. IA é infraestrutura, não categoria. Nenhum touchpoint pode usar FOMO, escassez falsa ou promessa de faturamento. Classificar certeza com a tag inline `dado`, por exemplo `<dado q="A" />`: `A` definido · `B` em validação · `C` hipótese · `D` histórico · `E` pendente.
4. Apresentar resultado ao usuário
