# ADR-0004 — Jornada guiada de registro de marca

- **Status**: Proposto
- **Data**: 2026-07-26
- **Decisores**: Ruan Braz

## Contexto

O módulo Ativos Registrados (ADR-0001) gerencia marcas **já depositadas ou registradas** (portfólio, processos, documentos, alertas, radar) e a Busca (ADR-0003) responde se um nome está livre **antes** do depósito. Entre as duas pontas existe um vazio: o processo de registro em si — busca prévia, escolha de classes, cadastro no e-INPI, GRU, depósito no e-Marcas, acompanhamento da RPI, exame, concessão e certificado — é executado manualmente, sem roteiro, sem registro do que já foi feito e sem cobrança de prova de cada etapa.

O risco prático não é ignorância do processo, e sim perda de prazos e de rastreabilidade: deferimentos que expiram sem pagamento da concessão, comprovantes de GRU perdidos, ninguém sabendo em que etapa cada marca parou.

## Problema

Como conduzir o registro de uma marca no INPI de ponta a ponta, garantindo que (a) cada etapa siga o procedimento e os links oficiais corretos, (b) nenhuma etapa seja dada como feita sem evidência, e (c) várias marcas em momentos diferentes do processo sejam acompanháveis de relance?

## Decisão

Adicionar ao módulo Ativos Registrados uma **jornada guiada de registro** (`/registros/registrar`): um wizard sequencial de 9 passos, com avanço condicionado a evidência, e cards de acompanhamento das jornadas em andamento. Sub-decisões estruturais:

### 1. Roteiro versionado no código, progresso no banco

A definição dos passos (títulos, instruções, links oficiais do INPI, postura recomendada, prazos legais e tipo de evidência exigida) vive em `website/src/lib/registros/jornada.ts`. O banco guarda apenas o progresso (`registro_jornadas`) e as evidências (`registro_jornada_evidencias`). Atualizar o roteiro é um deploy, não uma migração — jornadas em andamento passam a enxergar a versão corrente dos passos.

### 2. Avanço somente com evidência, validado no servidor

Cada passo declara o tipo de evidência que destrava o próximo: `texto` (análise, nº de processo, nº de RPI), `arquivo` (comprovante de GRU, protocolo, certificado) ou `confirmacao`. A API `jornadas/avancar` valida no servidor que a evidência exigida está presente e que o passo enviado é o passo atual — não há como pular etapas pelo cliente.

### 3. Reutilização da infraestrutura existente do módulo

Mesmo padrão de RLS (`is_admin()`), mesmo guard de API (`requireRegistrosAdmin`), mesmo bucket privado `registro-docs` (evidências em `jornadas/<id>/…`) e mesmo fluxo de upload por URL assinada dos documentos. Nenhuma infraestrutura nova.

### 4. Jornada informa, não peticiona

A plataforma **não** interage com sistemas do INPI em nome do usuário: todos os atos (GRU, depósito, petições) são feitos pelo próprio usuário nos sistemas oficiais, com a jornada servindo de roteiro, checklist probatório e memória do processo. Mesmo princípio dos ADRs 0001 e 0003: o sistema informa, a ação é humana.

## Alternativas consideradas

- **Passos como linhas no banco** (tabela de definição de passos): rejeitado — o roteiro muda por evolução do procedimento do INPI, não por dado do usuário; versionar no código dá revisão via git e elimina migrações de conteúdo.
- **Automatizar atos no INPI** (emissão de GRU, peticionamento): rejeitado — sem API pública, exigiria engenharia reversa frágil (mesmo motivo do descarte no ADR-0003) e criaria responsabilidade jurídica sobre atos processuais.
- **Usar `registro_processos` como acompanhamento**: rejeitado — processos modelam o estado jurídico após o depósito; a jornada cobre também o pré-depósito e o "quem fez o quê, com que prova", que são ortogonais ao status do processo.

## Consequências

- **Positivas**: processo repetível e auditável; prazos críticos (oposição, exigência, concessão) explícitos no passo em que importam; onboarding de novas marcas sem depender da memória de uma pessoa.
- **Negativas / trade-offs**: o roteiro é estático — mudanças de procedimento do INPI exigem atualização manual do código; a jornada não sincroniza automaticamente com o andamento real do processo no INPI (a ponte continua sendo o Radar e o cadastro manual em Marcas/Processos).
