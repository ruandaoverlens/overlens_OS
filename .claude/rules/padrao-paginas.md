---
paths:
  - "[PAGINA]*"
  - "[PESQUISA]*"
---

# Padrão para Páginas da Base de Conhecimento

> **Leia antes:** `.claude/rules/tese-atual.md` — fonte normativa sobre quem é o público, o que a Overlens é, o papel da IA e o vocabulário atual. Em conflito, aquela regra prevalece sobre qualquer documento da base.

## Regras de Escrita

Toda página criada para a base de conhecimento da Overlens DEVE:

1. Começar com H1 (título limpo) seguido de H2 (frase evocativa)
2. Usar português brasileiro acessível, sem jargão, sem gíria, sem formalidade excessiva
3. Respeitar as 4 virtudes: Científica, Profunda, Provocativa, Inspiradora
4. Incluir os guardrails éticos: sem guru, sem dogma, sem culpabilização
5. Seguir a **regra de público** e o **vocabulário atual** (abaixo)
6. Seguir metáforas do universo Overlens: fogo controlado, prisma, portal, micélio
7. **Classificar certeza** quando a afirmação for estratégica: DEFINIDO / EM VALIDAÇÃO / HIPÓTESE / HISTÓRICO / PENDENTE
8. EVITAR: lâmpada clichê, varinha mágica, forja, FOMO, hustle porn, promessas vazias

## Regra de Público — ELIMINATÓRIA

O público da Overlens é o **empreendedor**: quem tem uma ideia, ambição ou visão de futuro e quer transformá-la em realidade.

**O que define o público é o estado, não a profissão.** Esse empreendedor **pode ou não** ser designer, engenheiro, arquiteto, artista, inventor, maker ou pesquisador — e pode ser também um empreendedor de qualquer outra origem, inclusive sem formação específica.

**Proibido:**
- Chamar o público de "designers", "criativos" ou "profissionais criativos" como rótulo — design é uma das disciplinas que a Overlens ensina, não quem nos procura
- Definir o público por profissão, formação, cargo ou senioridade
- Usar "Empreendedor Nexialista" como nome do público

**Permitido:**
- "Empreendedor" como substantivo do público
- Profissões como **exemplos de origem**: "pode vir da engenharia, da arquitetura, da arte, do design ou de nenhuma dessas origens"
- Profissões dentro da **estrutura dinâmica de posicionamento**: "a escola de negócios dos criadores / dos artistas / dos engenheiros / dos designers"

> *"Nosso público são designers"* → proibido. *"A escola de negócios dos designers"*, como variação da expressão de posicionamento → permitido.

## Vocabulário

**Termos oficiais:** Overlens · **Atom** (membro da comunidade) · Nexialismo (capacidade, não rótulo de público) · Atom Praxis · Lente · Sistema Vivo · Capital Simbólico · projeto · evidência · realização

**Os quatro modos** são formas de agir, aprender, pensar e criar — **não** estágios sequenciais de maturidade, **não** hierarquia de senioridade:

> **Operante executa · Convergente conecta · Emergente cria · Nexialista orquestra**

**Obsoleto — não usar:**
- "Inconscientes" como perfil
- Os quatro modos descritos como "distância entre a ideia e a realidade"
- "Empreendedor Nexialista" como nome do público
- "átomo" como unidade de conteúdo
- Overlens como "escola de IA", ou "ensinar IA" como finalidade
- Overpass como "biblioteca", "assinatura de cursos" ou "Netflix de cursos"
- Vanguarda como "curso premium" ou apenas "mentoria"
- Cursos, assinatura ou lançamentos como única forma de monetização

## Termos Proibidos em Páginas

- "destrave", "acenda", "forje"
- "vagas limitadas", "última chance"
- "você pode tudo", "sem limites"
- "guru", "mestre iluminado"
- promessas de enriquecimento, faturamento ou "liberdade financeira"
- "escale seu negócio", "6 em 7", glamourização de rotina extrema, tom de startup bro
- qualquer promessa de resultado garantido

## Regra de Histórico

Informação historicamente verdadeira **não é apagada**. Quando um posicionamento, produto ou conceito for substituído, mova o registro para uma seção de **Histórico / Posicionamentos anteriores / Evolução** e marque como **HISTÓRICO**.

O erro a evitar não é preservar o passado — é permitir que ele seja lido como a definição atual da companhia.

## Regra de Imagens

- NUNCA coloque uma imagem como primeiro elemento após o banner (H1 + H2)
- Sempre inclua pelo menos alguns parágrafos de texto antes da primeira imagem
- O leitor precisa de contexto textual antes de ver uma imagem

## Regra de Arquivos

- A fonte canônica é `website/content/<sistema>/...` — inclui **frontmatter** (title, summary, topics, keywords, priority, ai_when_to_use, related)
- `TRU/<sistema>/...` é o mesmo corpo **sem frontmatter**
- Ao editar uma página, atualize os dois — e revise o frontmatter se termos do vocabulário mudaram
- Páginas novas: `NN - Nome da Página.md` dentro da seção numerada

## Estrutura Mínima

```
# Título
## Frase de abertura
Parágrafos introdutórios...
## Seção 1
...
## Seção 2
...
```
