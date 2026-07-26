// Roteiro da jornada de registro de marca junto ao INPI.
//
// A definição dos passos (títulos, instruções, links oficiais, postura
// recomendada e tipo de evidência exigida) vive aqui, no código. O banco
// (registro_jornadas / registro_jornada_evidencias) guarda só o progresso.
// Alterar o roteiro não exige migração — jornadas em andamento passam a
// enxergar a versão atual dos passos.

// ─── Linhas do banco ──────────────────────────────────────────

export type JornadaStatus = "em_andamento" | "concluida" | "arquivada";

// Resultado das análises de IA (termos de pesquisa / sugestão de classes),
// persistido na coluna jsonb `analise` da jornada.

export interface AnaliseTermo {
  termo: string;
  tipo: "fonetica" | "grafica" | "ideologica";
  motivo: string;
}

export interface AnaliseClasse {
  classe: string;
  titulo: string;
  motivo: string;
}

export interface AnaliseResultado {
  termos: AnaliseTermo[];
  classes: AnaliseClasse[];
  observacoes: string;
}

export interface JornadaAnalise {
  termos?: AnaliseResultado;
  classes?: AnaliseResultado;
}

export interface JornadaRow {
  id: string;
  nome_marca: string;
  titular: string;
  classes: string | null;
  marca_id: string | null;
  processo_numero: string | null;
  passo_atual: number;
  status: JornadaStatus;
  analise: JornadaAnalise;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JornadaEvidenciaRow {
  id: string;
  jornada_id: string;
  passo: number;
  nota: string | null;
  storage_path: string | null;
  arquivo_nome: string | null;
  mime_type: string | null;
  tamanho: number | null;
  created_by: string | null;
  created_at: string;
}

export const JORNADA_STATUS_LABEL: Record<JornadaStatus, string> = {
  em_andamento: "Em andamento",
  concluida: "Concluída",
  arquivada: "Arquivada",
};

export const JORNADA_STATUS_VARIANT: Record<
  JornadaStatus,
  "info" | "success" | "secondary"
> = {
  em_andamento: "info",
  concluida: "success",
  arquivada: "secondary",
};

// ─── Definição dos passos ─────────────────────────────────────

/**
 * O que o passo exige para ser concluído:
 * - "texto": nota escrita obrigatória (número, resumo, decisão)
 * - "arquivo": upload obrigatório (comprovante, protocolo, certificado)
 * - "confirmacao": basta confirmar a conclusão (nota opcional)
 */
export type EvidenciaTipo = "texto" | "arquivo" | "confirmacao";

export interface JornadaLink {
  titulo: string;
  url: string;
  /** true = rota interna da plataforma (abre na mesma aba). */
  interno?: boolean;
}

export interface JornadaPasso {
  numero: number;
  titulo: string;
  /** Resumo curto exibido nos cards e no stepper recolhido. */
  resumo: string;
  /** Instruções detalhadas, uma por parágrafo. */
  instrucoes: string[];
  /** Postura recomendada ao executar o passo. */
  postura: string;
  links: JornadaLink[];
  /** Prazo legal relevante, quando houver. */
  prazo?: string;
  evidencia: {
    tipo: EvidenciaTipo;
    /** Rótulo do campo de evidência. */
    label: string;
    placeholder?: string;
  };
}

export const JORNADA_PASSOS: JornadaPasso[] = [
  {
    numero: 1,
    titulo: "Busca prévia de disponibilidade",
    resumo: "Verificar se o nome está livre antes de gastar qualquer taxa.",
    instrucoes: [
      "Pesquise o nome na Busca da plataforma (cruza a base local com a consulta ao vivo do INPI) e depois confirme diretamente na busca oficial do INPI, marcando pesquisa por marca e testando variações: radical, grafias próximas e tradução.",
      "Avalie colidência além da igualdade exata: semelhança fonética, gráfica e ideológica dentro das classes de interesse e em classes afins.",
      "Se encontrar marca semelhante ativa na mesma classe, considere ajustar o nome ou a especificação antes de seguir — é muito mais barato do que receber um indeferimento depois.",
    ],
    postura:
      "Seja cética: procure motivos para o nome NÃO estar disponível. A análise automática é indicativa — a decisão de prosseguir é sempre humana e deve considerar colidência fonética e de segmento, não só texto idêntico.",
    links: [
      { titulo: "Busca da plataforma", url: "/registros/busca", interno: true },
      {
        titulo: "Busca oficial do INPI (pePI)",
        url: "https://busca.inpi.gov.br/pePI/",
      },
      {
        titulo: "Manual de Marcas do INPI",
        url: "https://manualdemarcas.inpi.gov.br/",
      },
    ],
    evidencia: {
      tipo: "texto",
      label: "Resumo da análise de disponibilidade",
      placeholder:
        "Ex.: Sem colidência relevante nas classes 41 e 42. Encontrada marca homônima na classe 25 (segmento distinto).",
    },
  },
  {
    numero: 2,
    titulo: "Definir classes de Nice e especificação",
    resumo: "Escolher as classes NCL e redigir a especificação de produtos/serviços.",
    instrucoes: [
      "Identifique as classes da Classificação de Nice (NCL) que cobrem a atividade real da marca — para a Overlens, tipicamente 41 (educação) e/ou 42 (tecnologia), mas confirme caso a caso.",
      "Prefira itens da lista pré-aprovada do INPI ao redigir a especificação: itens pré-aprovados não geram exigência de mérito sobre a redação.",
      "Cada classe é um pedido (e uma taxa) separado. Registre apenas classes que a marca realmente usa ou usará — classe sem uso pode cair por caducidade após 5 anos.",
    ],
    postura:
      "Precisão em vez de ambição: uma especificação enxuta e fiel ao uso real protege melhor do que uma lista inflada, que aumenta custo, risco de exigência e de oposição.",
    prazo: "Sem prazo legal — mas define o custo e o escopo de todo o processo.",
    links: [
      {
        titulo: "Classificação de produtos e serviços (INPI)",
        url: "https://www.gov.br/inpi/pt-br/servicos/marcas/classificacao",
      },
      {
        titulo: "Lista de classes NCL (WIPO, em português)",
        url: "https://nclpub.wipo.int/enfr/",
      },
    ],
    evidencia: {
      tipo: "texto",
      label: "Classes escolhidas e especificação",
      placeholder: "Ex.: NCL 41 — educação; cursos online. NCL 42 — software como serviço.",
    },
  },
  {
    numero: 3,
    titulo: "Cadastro no e-INPI",
    resumo: "Criar (ou validar) o cadastro do titular no sistema do INPI via gov.br.",
    instrucoes: [
      "Acesse o portal do INPI e faça login no sistema e-INPI com a conta gov.br do titular (pessoa jurídica exige vínculo do CNPJ no gov.br).",
      "Confira os dados cadastrais do titular — nome empresarial, CNPJ e endereço serão impressos no certificado exatamente como estiverem no cadastro.",
      "Verifique se o titular se enquadra em desconto de taxa (ME/EPP, MEI): o enquadramento é declarado no cadastro e reduz as GRUs em 60%.",
    ],
    postura:
      "Burocracia é feita uma única vez e bem feita: dados cadastrais errados aqui viram exigência (e atraso de meses) lá na frente. Confira tudo contra o cartão CNPJ.",
    links: [
      {
        titulo: "Portal e-INPI / emissão de GRU",
        url: "https://gru.inpi.gov.br/pag/",
      },
      {
        titulo: "Guia básico de marcas (INPI)",
        url: "https://www.gov.br/inpi/pt-br/servicos/marcas/guia-basico",
      },
    ],
    evidencia: {
      tipo: "confirmacao",
      label: "Cadastro validado no e-INPI",
      placeholder: "Observações (opcional) — ex.: titular enquadrado como EPP, desconto de 60%.",
    },
  },
  {
    numero: 4,
    titulo: "Emitir e pagar a GRU de depósito",
    resumo: "Gerar a Guia de Recolhimento da União (serviço 389) e pagar antes de protocolar.",
    instrucoes: [
      "No sistema de GRU do INPI, gere uma guia por classe com o serviço 389 (Pedido de registro de marca com especificação pré-aprovada) — ou 394 se a especificação for de livre redação.",
      "Pague a GRU antes de protocolar o pedido: o número da guia (\"nosso número\") é a chave que liga o pagamento ao formulário de depósito.",
      "Guarde o comprovante de pagamento — ele é a evidência deste passo e pode ser exigido em caso de divergência bancária.",
    ],
    postura:
      "Método antes de pressa: guia certa, serviço certo, classe certa. Uma GRU emitida com serviço errado não é aproveitável e o valor pago não é restituído automaticamente.",
    prazo: "A GRU deve estar paga antes do envio do formulário de depósito.",
    links: [
      {
        titulo: "Emissão de GRU (e-INPI)",
        url: "https://gru.inpi.gov.br/pag/",
      },
      {
        titulo: "Tabela de retribuições de marcas (INPI)",
        url: "https://www.gov.br/inpi/pt-br/servicos/tabelas-de-retribuicao",
      },
    ],
    evidencia: {
      tipo: "arquivo",
      label: "Comprovante de pagamento da GRU",
    },
  },
  {
    numero: 5,
    titulo: "Protocolar o pedido no e-Marcas",
    resumo: "Preencher o formulário eletrônico, anexar a arte (se mista/figurativa) e depositar.",
    instrucoes: [
      "Acesse o sistema e-Marcas com o número da GRU paga e preencha o formulário: dados do titular, apresentação da marca (nominativa, mista, figurativa ou tridimensional), classe e especificação definidas no passo 2.",
      "Para marca mista ou figurativa, anexe a imagem no padrão exigido (JPG, 8×8 cm, 300 dpi) — a arte protocolada é a que fica protegida; mudou o logo, muda-se o registro.",
      "Envie o pedido e guarde o protocolo: o número do processo (formato 9XXXXXXXX) é a identidade da marca no INPI daqui em diante.",
    ],
    postura:
      "Revisão tripla antes do envio: depois de protocolado, erros de titular, classe ou arte não se corrigem — geram exigência ou exigem novo depósito com nova taxa.",
    links: [
      {
        titulo: "Sistema e-Marcas (peticionamento)",
        url: "https://gru.inpi.gov.br/pag/",
      },
      {
        titulo: "Manual de Marcas — depósito",
        url: "https://manualdemarcas.inpi.gov.br/",
      },
    ],
    evidencia: {
      tipo: "arquivo",
      label: "Protocolo de depósito (PDF) — informe o nº do processo na nota",
      placeholder: "Nº do processo — ex.: 923456789",
    },
  },
  {
    numero: 6,
    titulo: "Acompanhar a publicação na RPI",
    resumo: "Aguardar a publicação do pedido e monitorar o prazo de oposição de terceiros.",
    instrucoes: [
      "O pedido é publicado na Revista da Propriedade Industrial (RPI), que sai toda terça-feira. A partir da publicação, terceiros têm 60 dias para apresentar oposição.",
      "Acompanhe semanalmente a RPI ou o processo no pePI usando o número do protocolo. O Radar da plataforma também monitora as publicações e gera alertas.",
      "Se houver oposição, você será intimado pela RPI e terá 60 dias para apresentar manifestação (não é obrigatória, mas é recomendável).",
    ],
    postura:
      "Vigilância constante e serena: perder uma publicação não desfaz o processo, mas perder um prazo de resposta sim. Registre o nº da RPI de publicação e anote os prazos no calendário.",
    prazo: "Oposição de terceiros: 60 dias a partir da publicação do pedido na RPI.",
    links: [
      {
        titulo: "Revista da Propriedade Industrial (RPI)",
        url: "https://revistas.inpi.gov.br/rpi/",
      },
      {
        titulo: "Acompanhamento de processo (pePI)",
        url: "https://busca.inpi.gov.br/pePI/",
      },
      { titulo: "Radar da plataforma", url: "/registros/radar", interno: true },
    ],
    evidencia: {
      tipo: "texto",
      label: "Nº da RPI de publicação e situação",
      placeholder: "Ex.: Publicado na RPI 2795 de 22/07/2026. Sem oposições até o momento.",
    },
  },
  {
    numero: 7,
    titulo: "Exame de mérito e exigências",
    resumo: "Aguardar o exame do INPI e responder exigências dentro do prazo, se houver.",
    instrucoes: [
      "Encerrado o prazo de oposição, o pedido entra na fila de exame de mérito. O examinador pode deferir, indeferir ou formular exigência (pedido de esclarecimento ou correção).",
      "Exigência é publicada na RPI e deve ser cumprida em 60 dias via petição (GRU de cumprimento de exigência, serviço 338). Não responder arquiva o pedido definitivamente.",
      "Em caso de indeferimento, cabe recurso em 60 dias — avalie com apoio jurídico se o fundamento do indeferimento é contornável.",
    ],
    postura:
      "Leia o despacho inteiro antes de reagir: boa parte das exigências é simples (esclarecimento de especificação, documento faltante) e se resolve sem advogado — mas indeferimento e oposição merecem análise jurídica.",
    prazo: "Cumprimento de exigência: 60 dias. Recurso contra indeferimento: 60 dias.",
    links: [
      {
        titulo: "Acompanhamento de processo (pePI)",
        url: "https://busca.inpi.gov.br/pePI/",
      },
      {
        titulo: "Manual de Marcas — exame",
        url: "https://manualdemarcas.inpi.gov.br/",
      },
    ],
    evidencia: {
      tipo: "texto",
      label: "Resultado do exame",
      placeholder: "Ex.: Deferido na RPI 2810 de 03/11/2026, sem exigências.",
    },
  },
  {
    numero: 8,
    titulo: "Pagar a concessão (1º decênio)",
    resumo: "Após o deferimento, pagar a GRU de concessão dentro do prazo para o registro nascer.",
    instrucoes: [
      "Com o pedido deferido, emita e pague a GRU do serviço 371 (concessão do registro + proteção do 1º decênio) em até 60 dias contados da publicação do deferimento.",
      "Perdeu o prazo ordinário? Ainda há um prazo extraordinário de 30 dias com valor adicional. Depois disso o pedido é definitivamente arquivado.",
      "O registro só existe juridicamente após esse pagamento — deferimento sem concessão paga não protege nada.",
    ],
    postura:
      "Trate este prazo como inegociável: é a etapa em que mais marcas deferidas morrem por esquecimento. Pague no prazo ordinário e guarde o comprovante.",
    prazo: "60 dias do deferimento (ordinário) + 30 dias extraordinários com adicional.",
    links: [
      {
        titulo: "Emissão de GRU (e-INPI)",
        url: "https://gru.inpi.gov.br/pag/",
      },
      {
        titulo: "Tabela de retribuições de marcas (INPI)",
        url: "https://www.gov.br/inpi/pt-br/servicos/tabelas-de-retribuicao",
      },
    ],
    evidencia: {
      tipo: "arquivo",
      label: "Comprovante de pagamento da concessão",
    },
  },
  {
    numero: 9,
    titulo: "Certificado de registro",
    resumo: "Baixar o certificado, arquivar tudo e programar a renovação decenal.",
    instrucoes: [
      "A concessão é publicada na RPI e o certificado digital fica disponível no e-INPI. Baixe o PDF e arquive-o em Documentos, vinculado à marca.",
      "O registro vale 10 anos a partir da concessão, prorrogável indefinidamente por períodos iguais. A renovação deve ser pedida no último ano de vigência (ou em até 6 meses após, com adicional).",
      "Cadastre a marca e o processo no portfólio da plataforma para que os alertas de renovação e o Radar de colidências passem a monitorá-la automaticamente.",
    ],
    postura:
      "Registro concedido não é fim, é manutenção: uso contínuo (para evitar caducidade), vigilância de colidências e renovação em dia são o que mantém o ativo vivo.",
    prazo: "Vigência de 10 anos; renovação no último ano de vigência.",
    links: [
      { titulo: "Portal e-INPI", url: "https://gru.inpi.gov.br/pag/" },
      { titulo: "Marcas da plataforma", url: "/registros/marcas", interno: true },
      { titulo: "Documentos da plataforma", url: "/registros/documentos", interno: true },
    ],
    evidencia: {
      tipo: "arquivo",
      label: "Certificado de registro (PDF)",
    },
  },
];

export const TOTAL_PASSOS = JORNADA_PASSOS.length;

/** Classes de Nice recorrentes nos registros da Overlens. */
export const CLASSES_COMUNS_OVERLENS: Array<{ classe: string; uso: string }> = [
  { classe: "41", uso: "Educação, cursos e treinamento" },
  { classe: "42", uso: "Software, SaaS e serviços de tecnologia" },
  { classe: "09", uso: "Aplicativos e conteúdo digital baixável" },
  { classe: "35", uso: "Marketing, publicidade e gestão de negócios" },
];

export function getPasso(numero: number): JornadaPasso | undefined {
  return JORNADA_PASSOS.find((p) => p.numero === numero);
}
