-- Seed do módulo "Ativos Registrados" com dados reais do INPI.
--
-- Titular: LENSE DEGREE ESCOLA DE DESIGN LTDA.
--   - OVERLENS: 4 processos (classes 09, 35, 41, 42), depósito em
--     2022-02-10, todos com registro concedido e em vigor.
--   - NEXIALISTA: 3 processos (classes 09, 35, 42), depósito em
--     2024-04-11, ainda aguardando exame de mérito.
--
-- Seed idempotente: marcas inseridas apenas se ainda não existirem
-- (por nome+titular), processos com `on conflict (numero) do nothing`,
-- eventos de depósito com `where not exists`.
--
-- Não inserimos evento de "concessão" para os processos da OVERLENS
-- porque não temos a data exata de concessão confirmada pelo
-- certificado — apenas o evento de depósito é registrado para os 7
-- processos, evitando dado especulativo na timeline.

-- ============================================================
-- Marcas
-- ============================================================
insert into public.registro_marcas (nome, apresentacao, titular)
select 'OVERLENS', 'mista', 'LENSE DEGREE ESCOLA DE DESIGN LTDA'
where not exists (
  select 1 from public.registro_marcas
  where nome = 'OVERLENS' and titular = 'LENSE DEGREE ESCOLA DE DESIGN LTDA'
);

insert into public.registro_marcas (nome, apresentacao, titular)
select 'NEXIALISTA', 'mista', 'LENSE DEGREE ESCOLA DE DESIGN LTDA'
where not exists (
  select 1 from public.registro_marcas
  where nome = 'NEXIALISTA' and titular = 'LENSE DEGREE ESCOLA DE DESIGN LTDA'
);

-- ============================================================
-- Processos — OVERLENS (registrada, em vigor)
-- ============================================================
insert into public.registro_processos
  (marca_id, numero, classe, edicao_ncl, classe_descricao, status, situacao, data_deposito, observacoes)
select
  (select id from public.registro_marcas where nome = 'OVERLENS' and titular = 'LENSE DEGREE ESCOLA DE DESIGN LTDA'),
  v.numero, v.classe, 'NCL(11)', v.classe_descricao, 'registrada', 'Registro de marca em vigor', '2022-02-10',
  'Preencher data de concessão e próxima renovação a partir do certificado.'
from (values
  ('925697761', '09', 'Aparelhos e instrumentos científicos; software e aplicativos'),
  ('925697826', '35', 'Publicidade; gestão de negócios'),
  ('925697869', '41', 'Educação; formação; entretenimento'),
  ('925697958', '42', 'Serviços científicos e tecnológicos; desenvolvimento de software')
) as v(numero, classe, classe_descricao)
on conflict (numero) do nothing;

-- ============================================================
-- Processos — NEXIALISTA (requerida, aguardando exame de mérito)
-- ============================================================
insert into public.registro_processos
  (marca_id, numero, classe, edicao_ncl, classe_descricao, status, situacao, data_deposito)
select
  (select id from public.registro_marcas where nome = 'NEXIALISTA' and titular = 'LENSE DEGREE ESCOLA DE DESIGN LTDA'),
  v.numero, v.classe, 'NCL(12)', v.classe_descricao, 'requerida', 'Aguardando exame de mérito', '2024-04-11'
from (values
  ('934187274', '09', 'Aparelhos e instrumentos científicos; software e aplicativos'),
  ('934187592', '35', 'Publicidade; gestão de negócios'),
  ('934187690', '42', 'Serviços científicos e tecnológicos; desenvolvimento de software')
) as v(numero, classe, classe_descricao)
on conflict (numero) do nothing;

-- ============================================================
-- Eventos de depósito (todos os 7 processos)
-- ============================================================
insert into public.registro_eventos (processo_id, tipo, titulo, data)
select p.id, 'deposito', 'Depósito do pedido', p.data_deposito
from public.registro_processos p
where p.numero in (
  '925697761', '925697826', '925697869', '925697958',
  '934187274', '934187592', '934187690'
)
and not exists (
  select 1 from public.registro_eventos e
  where e.processo_id = p.id and e.tipo = 'deposito'
);
