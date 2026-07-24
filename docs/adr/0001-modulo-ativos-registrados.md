# ADR-0001 — Módulo de Ativos Registrados (gestão de propriedade intelectual)

- **Status**: Aceito
- **Data**: 2026-07-24
- **Decisores**: Ruan Braz

## Contexto

A plataforma Overlens OS centraliza hoje a identidade digital da marca: logos, cores, tipografia, assets, templates, guidelines, tom de voz e biblioteca de marca.

Toda a dimensão jurídica, porém, permanece fora do sistema. Registros no INPI, certificados, classes, renovações e monitoramento ficam espalhados entre e-mails, PDFs, planilhas e o escritório de propriedade intelectual. Consequências:

- ativos jurídicos não fazem parte da gestão da marca;
- risco de perda de prazos (uma renovação perdida pode significar a perda da marca);
- dificuldade de acompanhar publicações semelhantes na RPI;
- a equipe perde contexto sobre a situação legal da marca.

## Problema

A plataforma administra a **identidade** da marca, mas não administra sua **propriedade**. Isso cria uma ruptura entre branding e propriedade intelectual: a marca deixa de ser um ativo único e passa a existir em dois mundos desconectados.

## Decisão

Adicionar à plataforma um novo módulo, **Ativos Registrados**, responsável pela gestão de propriedade intelectual das marcas da Overlens, tornando a plataforma a fonte única de verdade para qualquer ativo de marca — visual, digital, jurídico ou estratégico.

A decisão se desdobra em seis sub-decisões estruturais:

### 1. Escopo de acesso: interno, mono-tenant

O módulo é uma feature interna, disponível apenas para usuários `@overlens.com.br` (o controle de acesso por domínio/role está sendo tratado em frente de trabalho separada). Não há requisitos multi-tenant nesta fase: a modelagem de dados pode assumir um único titular (Overlens). Uma eventual abertura para clientes exigirá novo ADR (RLS multi-tenant, permissões, economics do monitoramento).

### 2. Papel do sistema nos prazos: espelho de conveniência, não fonte primária

Na v1, o sistema **espelha** o controle de prazos; a responsabilidade formal por renovações e respostas a exigências permanece com o escritório de propriedade intelectual. O sistema alerta e organiza, mas não substitui o controle profissional. Promover o sistema a fonte primária de controle de prazos exige histórico comprovado de alertas funcionando e será objeto de decisão futura.

### 3. IA: copiloto de análise com validação humana obrigatória

O assistente de IA **informa, contextualiza e estrutura caminhos de ação** ("o que significa esta exigência?", "essa publicação oferece risco?", "quais argumentos sustentariam uma oposição?"). A decisão jurídica é sempre humana, validada pela equipe e pelo escritório. Esse enquadramento é viável porque o módulo é interno e a equipe tem protocolos e senso crítico para julgar as saídas — e deve ser mantido como fronteira explícita caso o módulo um dia vire produto.

Regras técnicas do assistente:

- **Grounding obrigatório**: toda resposta jurídica é gerada com o documento-fonte no contexto (despacho, trecho da revista, artigos da LPI quando necessário) e deve citar a fonte. Nenhuma resposta "de memória" do modelo.
- **Modelo por sensibilidade do dado**: Gemma 4 31B (free, via OpenRouter — já é o default da plataforma em `website/src/lib/ai/models.ts`) para dados públicos (RPI, análise de colidência, despachos publicados). Documentos internos sensíveis (procurações, estratégias de oposição, pareceres do escritório) **não passam por endpoints free** — usam modelo pago (Claude Haiku/Sonnet, já configurados), pela política de uso de dados dos provedores em tiers gratuitos. A arquitetura em `models.ts` é model-agnostic; evoluir de modelo é trocar uma string.

### 4. Radar (monitoramento da RPI): dado oficial + matching determinístico + triagem por IA

- **Fonte**: os arquivos XML semanais publicados oficialmente pelo INPI (dado público, sem scraping frágil).
- **Ingestão**: cron job semanal no Vercel (mesmo mecanismo do watchdog do Magny em `website/vercel.json`), que baixa e parseia a revista.
- **Matching em código, não em IA**: busca exata + fonética (Metaphone adaptado ao português) + distância de edição contra as marcas cadastradas. Determinístico, auditável e barato.
- **IA apenas na triagem**: para os candidatos levantados pelo matching, o modelo avalia semelhança de segmento/classe e redige o resumo do alerta. Todo alerta é revisado por humano.

### 5. Navegação e visibilidade: área própria, existência oculta para não autorizados

- **Ponto de entrada**: um ícone **®** na barra de ícones da sidebar principal (ao lado dos ícones de pastas, documentos e conversas), simbolizando marca registrada.
- **Área dedicada**: o ícone abre uma página nova com **sidebar própria e recursos próprios** — o módulo é um espaço separado dentro da plataforma, não uma seção dentro da navegação de documentos existente.
- **Visibilidade condicionada**: o ícone ® só é renderizado para perfis `@overlens.com.br` com role autorizada (admin). Para qualquer outro usuário, o módulo **não deve dar sinal de que existe** — nem ícone, nem item de menu, nem referência na interface.
- **Ocultação não é segurança**: esconder o ícone é requisito de discrição, não o mecanismo de proteção. As rotas e APIs do módulo devem ser bloqueadas server-side (edge middleware por role, mesmo mecanismo já adotado na plataforma), respondendo como se a rota não existisse (404/redirect) para não autorizados — nunca apenas ocultação client-side.

### 6. Entregas faseadas

**v1a — Cofre + calendário jurídico** (o núcleo, ~80% da dor descrita no Contexto):

- Área "Ativos Registrados" acessada pelo ícone ® na sidebar, com sidebar própria (sub-decisão 5) e uma página por marca: status, número do processo, classes, titular, data do depósito, data da concessão, próxima renovação, observações.
- Visualização das classes protegidas (ex.: 41 Educação, 42 Software, 9 Aplicativos, 35 Negócios).
- Armazenamento de documentos: certificado, protocolo, despacho, oposição, exigências, procurações, comprovantes.
- Timeline do processo: depósito → publicação → exame → exigência → resposta → concessão → renovação.
- Alertas de prazo: renovações, exigências, oposições, risco de perda de prazo.

**v1b — Radar + assistente de IA** (após v1a estável; o parsing da RPI tem cauda de casos atípicos e pede calibração):

- Pipeline de ingestão da RPI e matching conforme sub-decisão 4.
- Alertas de novas publicações iguais/semelhantes.
- Assistente de IA conforme sub-decisão 3.

**v2 — Exploratório** (cada item será avaliado individualmente; nenhum é compromisso):

- Sugestão automática de classes a registrar com base no negócio.
- Análise de novos nomes antes do lançamento (disponibilidade, conflito, pronúncia, internacionalização, força da marca).
- Consulta de domínios (.com, .com.br, .ai, .dev, .io).
- Disponibilidade de handles em redes sociais — marcado como frágil: depende de scraping possivelmente contra os termos de uso das plataformas.
- Organização de registros internacionais (WIPO, USPTO, EUIPO).

## Alternativas consideradas

- **Manter a gestão de PI fora do sistema** (status quo: planilhas, e-mails, escritório): descartada — perpetua a ruptura identidade × propriedade e o risco de prazos perdidos.
- **Ferramenta de terceiros especializada em PI** (Alt Legal, Corsearch e similares): descartada nesta fase — mantém a marca em dois mundos, tem custo recorrente e não se integra ao contexto de branding que já vive na plataforma.
- **v1 completa com Radar e IA desde o início**: descartada — Radar e IA são categorias de esforço distintas do CRUD + storage + datas da v1a; entregar tudo junto atrasaria o valor imediato.
- **Sistema como fonte primária de prazos desde a v1**: descartada — transformaria o módulo em infraestrutura crítica com consequência jurídica real antes de qualquer histórico de confiabilidade.

## Consequências

**Melhora:**

- Uma única plataforma para administrar toda a identidade da empresa, incluindo sua dimensão jurídica.
- Menos dependência de planilhas e e-mails; menos risco de perda de contexto.
- Mais contexto jurídico disponível para decisões de marketing e produto.
- Maior organização do portfólio de marcas.

**Custos e riscos assumidos:**

- Novo domínio de dados no Supabase (que é compartilhado entre dev/preview/produção — cuidado redobrado com queries destrutivas).
- Pipeline de ingestão da RPI exige manutenção contínua (formato dos arquivos do INPI pode mudar).
- Documentos jurídicos sensíveis passam a viver na plataforma — reforça a importância do controle de acesso por domínio em andamento.
- Dependência do OpenRouter para os modelos de IA.

**Passa a ser obrigatório:**

- Rotas e APIs do módulo bloqueadas server-side por role (edge middleware); a ocultação do ícone ® é apenas discrição, nunca o mecanismo de proteção.
- Toda resposta do assistente de IA ancorada em documento-fonte, com citação.
- Documentos internos sensíveis nunca processados por modelos em tier gratuito.
- Todo alerta do Radar revisado por humano antes de gerar ação.

## Critérios de sucesso

- 100% das marcas depositadas pela Overlens cadastradas no módulo (fazer o inventário do portfólio é o primeiro passo da v1a).
- Todos os documentos jurídicos centralizados na plataforma.
- Alertas automáticos de prazo funcionando (v1a) e alertas da RPI funcionando (v1b).
- Nenhum prazo perdido — com a ressalva de que a responsabilidade formal permanece com o escritório (sub-decisão 2).
- Consulta de status de qualquer marca em menos de 30 segundos.
- Histórico completo acessível para toda a equipe autorizada.
