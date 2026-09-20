---
name: escrever
description: Fase de escrita — Cria uma nova página do Brand System a partir do briefing de pesquisa. Use após /pesquisar. Argumento = nome da página.
argument-hint: Nome da Página (ex: "Território de Palavras")
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# /escrever — Fase de Escrita

Você está iniciando a fase de ESCRITA para a página "$ARGUMENTS".

## Instruções

1. Verifique que `[PESQUISA] $ARGUMENTS.md` existe (se não, avise o usuário para rodar /pesquisar primeiro)
2. Lance o agente `escritor` com a seguinte instrução:
   - Ler `.claude/rules/tese-atual.md` — fonte normativa; prevalece sobre qualquer documento da base
   - Ler o briefing de pesquisa
   - Ler a base canônica pertinente em `website/content/<sistema>/` (espelho sem frontmatter em `TRU/<sistema>/`)
   - Ler a página modelo indicada no briefing — como referência de **tom e estrutura**, não de conteúdo conceitual (boa parte da base é anterior à tese atual)
   - Escrever a página completa
3. Salvar resultado em `[PAGINA] $ARGUMENTS.md`
4. Apresentar um resumo ao usuário com:
   - Extensão (palavras)
   - Estrutura criada (lista de H2/H3)
   - Tom predominante usado

## Regras Críticas para o Escritor

- Tom de voz: Provocativo-inteligente, profundo-acessível, científico-simples, inspirador-realista
- Estrutura: H1 → H2 abertura → Parágrafos → Subtítulos → Listas → Exemplos
- Linguagem: PT-BR contemporâneo, sem jargão, sem gíria, sem formalidade excessiva
- Filosofia: Criação + autonomia + responsabilidade. Sem guru, sem dogma, sem promessa vazia
- Vocabulário: Respeitar termos oficiais (Overlens, **Atom** como membro da comunidade, Nexialismo como capacidade, Atom Praxis, Lente, Sistema Vivo, Capital Simbólico), naming, painel semântico
- Público: o **empreendedor** — define-se pelo estado, não pela profissão. PROIBIDO rotulá-lo como "designers", "criativos" ou "Empreendedor Nexialista". Profissões só como exemplos de origem ou na estrutura dinâmica de posicionamento ("a escola de negócios dos criadores / dos artistas / dos engenheiros / dos designers")
- Quatro modos: Operante executa · Convergente conecta · Emergente cria · Nexialista orquestra — formas de agir e pensar, não estágios nem senioridade. Não existe "Inconsciente"
- IA é infraestrutura, não categoria. Atlas = entrada e ativação · Overpass = camada contínua · Vanguarda = camada de aceleração
- Classificar certeza das afirmações estratégicas: DEFINIDO / EM VALIDAÇÃO / HIPÓTESE / HISTÓRICO / PENDENTE
- Não inventar personas: as antigas estão desatualizadas; marcar material dependente delas como "necessita revisão de persona"
