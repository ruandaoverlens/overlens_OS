# Architecture Decision Records (ADRs)

Este diretório registra as decisões arquiteturais do projeto Overlens OS — tanto da plataforma (`website/`) quanto de infraestrutura e processos.

## O que é um ADR

Um ADR documenta **uma decisão** com consequências duradouras: o contexto que a motivou, as alternativas consideradas, a decisão tomada e seus trade-offs. Não é um PRD — detalhes de funcionalidade ficam fora; aqui entra o que muda a arquitetura, o risco ou a direção do produto.

## Convenções

- **Nome do arquivo**: `NNNN-titulo-em-kebab-case.md` (numeração sequencial, quatro dígitos).
- **Idioma**: português brasileiro.
- **Status**: `Proposto` → `Aceito` → (`Substituído por ADR-NNNN` ou `Obsoleto`). ADRs aceitos nunca são editados no mérito — uma nova decisão gera um novo ADR que substitui o anterior.
- **Template**: use `template.md` como base.

## Índice

| ADR | Título | Status |
|-----|--------|--------|
| [0001](0001-modulo-ativos-registrados.md) | Módulo de Ativos Registrados (gestão de propriedade intelectual) | Aceito |
| [0002](0002-autorizacao-e-controle-de-acesso.md) | Autorização e controle de acesso por domínio/role | Aceito |
| [0003](0003-consulta-disponibilidade-marcas.md) | Consulta de disponibilidade de marcas | Aceito |
| [0004](0004-jornada-guiada-registro-marca.md) | Jornada guiada de registro de marca | Proposto |
