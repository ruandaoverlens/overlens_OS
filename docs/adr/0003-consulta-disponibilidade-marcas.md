# ADR-0003 — Consulta de disponibilidade de marcas

- **Status**: Aceito
- **Data**: 2026-07-24
- **Decisores**: Ruan Braz

## Contexto

O módulo Ativos Registrados (ADR-0001) já cobre o monitoramento **reativo** de colidência: o Radar RPI baixa semanalmente a Revista da Propriedade Industrial e faz matching determinístico contra as marcas cadastradas, alertando sobre publicações semelhantes às marcas que a Overlens já possui.

Falta a ponta oposta do problema: a consulta **proativa** de disponibilidade — verificar se um nome novo está livre para uso e depósito *antes* de lançar um produto, uma marca ou uma linha de negócio. Hoje essa checagem é manual e informal.

O cenário de acesso ao dado do INPI é limitado:

- O INPI não expõe uma API pública documentada de busca de marcas.
- A nova plataforma de busca (`servicos.busca.inpi.gov.br`) tem uma API interna, mas não documentada, não versionada e protegida por hCaptcha — uso programático depende de engenharia reversa contra um alvo que pode mudar sem aviso.
- Escritórios profissionais de propriedade intelectual resolvem esse problema com sistemas próprios (ex.: APOL/LDSoft, Marca Acompanhada), construídos sobre anos de RPIs acumuladas — ou seja, a resposta do mercado é ter uma base histórica própria, não depender de uma API ao vivo do INPI.

## Problema

Como consultar a disponibilidade de um nome de marca — com veredicto de risco e lista de processos colidentes — sem depender de engenharia reversa de uma API não documentada, e sem esperar anos até que a base própria acumulada pelo Radar seja grande o suficiente para ser confiável sozinha?

## Decisão

Adicionar ao módulo Ativos Registrados uma funcionalidade de **consulta de disponibilidade de marcas**, que combina uma fonte externa ao vivo com uma base própria incremental e um ranking de risco determinístico. A decisão se desdobra em cinco sub-decisões estruturais:

### 1. Consulta ao vivo via API de terceiros (Infosimples)

A busca em tempo real contra o estoque completo do INPI é feita por meio da [Infosimples](https://api.infosimples.com) (produto "INPI / Marcas"), uma API REST/JSON com custo por consulta. É a única forma estável de consultar o universo completo de marcas do INPI sem depender de engenharia reversa frágil de um endpoint interno não documentado.

- Token de acesso (`INFOSIMPLES_TOKEN`) gerenciado via Infisical, nos ambientes `dev`, `preview` e `production`, seguindo o mesmo padrão de segredos já adotado na plataforma.

### 2. Base própria incremental, alimentada pelo próprio Radar

O pipeline de ingestão do Radar (`radar/ingest`, ADR-0001) passa a **persistir** todas as publicações de cada RPI processada — não só as que colidem com marcas cadastradas — na tabela `registro_rpi_publicacoes`. Isso constrói, revista após revista, um histórico local pesquisável, no mesmo modelo usado pelos sistemas profissionais de PI (base acumulada em vez de consulta pontual).

- A busca local reutiliza a mesma normalização e comparação fonética já implementada em `matching.ts`, garantindo que os dois caminhos de busca (local e Infosimples) falem a mesma língua.

### 3. Ranking de risco determinístico, reaproveitando a lógica do Radar

O veredicto de disponibilidade não é gerado por IA nem por heurística nova: reutiliza `avaliarSimilaridade` (`website/src/lib/registros/matching.ts`), a mesma função que já sustenta o matching do Radar. Os critérios — correspondência exata, contenção, semelhança fonética, distância de edição — são combinados num veredicto agregado:

- `indisponivel`
- `risco_alto`
- `risco_medio`
- `provavelmente_disponivel`

Como no ADR-0001 (sub-decisão 3), o sistema **informa, não decide**: o veredicto orienta, mas a decisão de prosseguir com um nome é sempre humana.

### 4. Degradação graciosa sem o token da Infosimples

Se `INFOSIMPLES_TOKEN` não estiver configurado, a consulta não falha — ela opera apenas contra a base local (`registro_rpi_publicacoes`), e a resposta/UI comunica explicitamente essa limitação (cobertura parcial, dependente do que já foi acumulado pelo Radar).

### 5. Engenharia reversa da API interna do INPI descartada como fundação

Ver "Alternativas consideradas".

## Alternativas consideradas

- **Engenharia reversa da API interna do INPI** (`servicos.busca.inpi.gov.br`): descartada como fundação da funcionalidade. É um endpoint não documentado, protegido por hCaptcha, sem contrato de estabilidade — pode quebrar sem aviso e comprometer uma funcionalidade que a equipe passaria a depender.
- **Usar apenas a base local acumulada pelo Radar**: descartada isoladamente — a tabela `registro_rpi_publicacoes` só acumula movimentações a partir do momento em que o Radar começa a rodar; não tem o estoque histórico de marcas já registradas, então não é suficiente sozinha para um veredicto de disponibilidade confiável no curto e médio prazo. Permanece como camada complementar (sub-decisão 2), que ganha valor com o tempo.
- **Assinar um software de terceiros pronto** (APOL/LDSoft, Marca Acompanhada e similares): descartado nesta fase — solução cara, vive fora do sistema, não se integra ao contexto de branding e PI que já reside na plataforma (mesma lógica de rejeição de ferramentas de terceiros já registrada no ADR-0001).

## Consequências

**Melhora:**

- A Overlens ganha uma checagem de disponibilidade de nome integrada ao mesmo lugar onde já vive a gestão de PI, em vez de um processo manual e informal.
- A base local cresce a cada RPI processada, reduzindo gradualmente a dependência da API de terceiros ao longo do tempo.
- Reaproveitamento de infraestrutura já validada (`matching.ts`, pipeline de ingestão do Radar), sem criar um novo motor de comparação paralelo.

**Custos e riscos assumidos:**

- Custo variável por consulta à Infosimples — cada busca ao vivo tem custo monetário direto.
- Dependência de um fornecedor externo para obter a visão completa e atualizada do estoque do INPI; mudanças de contrato, preço ou disponibilidade da Infosimples afetam a funcionalidade.
- A tabela `registro_rpi_publicacoes` cresce continuamente — exige atenção a volume e indexação ao longo do tempo.

**Passa a ser obrigatório:**

- Idempotência por revista na persistência de `registro_rpi_publicacoes`: reprocessar uma RPI já ingerida nunca pode gerar duplicatas.
- O token da Infosimples vive exclusivamente no Infisical, nunca hardcoded ou versionado.
- Toda consulta sem token configurado deve informar explicitamente ao usuário que está operando em modo degradado (só base local).

## Critérios de sucesso

- Buscar um nome de marca + classes e receber um veredicto de risco com a lista de processos colidentes em menos de 30 segundos.
- A base local (`registro_rpi_publicacoes`) acumula publicações a cada RPI processada pelo Radar, sem duplicatas.
- A busca continua funcionando, em modo degradado (só base local, com aviso explícito de cobertura parcial), mesmo sem o token da Infosimples configurado.
