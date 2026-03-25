-- Migration: 20260324000001_magny_schema
-- Description: Creates all Magny tables (sources, pipeline, news, reports, analytics, feedback).
--              The profiles table already exists in this project — only referenced via FKs.
--              Includes triggers for updated_at and the handle_new_user function.

-- ============================================================
-- FUNCTION: update_updated_at
-- Generic trigger function that stamps updated_at = now() on
-- any UPDATE.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLE: sources
-- News and data sources consumed by the research pipeline.
-- Categories follow the 3 pilares: tecnologia, negocios, criacao.
-- ============================================================

CREATE TABLE public.sources (
    id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name              text        NOT NULL,
    type              text        NOT NULL,
    url               text,
    category          text        NOT NULL,
    reliability_score integer     NOT NULL DEFAULT 5,
    is_active         boolean     NOT NULL DEFAULT true,
    config            jsonb       NOT NULL DEFAULT '{}',
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT sources_type_check              CHECK (type IN ('rss', 'api', 'instagram', 'manual')),
    CONSTRAINT sources_category_check          CHECK (category IN ('tecnologia', 'negocios', 'criacao')),
    CONSTRAINT sources_reliability_score_check CHECK (reliability_score BETWEEN 1 AND 10)
);

CREATE INDEX idx_sources_type      ON public.sources (type);
CREATE INDEX idx_sources_category  ON public.sources (category);
CREATE INDEX idx_sources_is_active ON public.sources (is_active);

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_sources
  BEFORE UPDATE ON public.sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABLE: pipeline_runs
-- Each execution of the full research pipeline.
-- ============================================================

CREATE TABLE public.pipeline_runs (
    id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    status               text        NOT NULL DEFAULT 'pending',
    triggered_by         text        NOT NULL,
    triggered_by_user_id uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
    started_at           timestamptz,
    completed_at         timestamptz,
    error_message        text,
    metadata             jsonb       NOT NULL DEFAULT '{}',
    created_at           timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT pipeline_runs_status_check       CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    CONSTRAINT pipeline_runs_triggered_by_check CHECK (triggered_by IN ('cron', 'manual'))
);

CREATE INDEX idx_pipeline_runs_status     ON public.pipeline_runs (status);
CREATE INDEX idx_pipeline_runs_created_at ON public.pipeline_runs (created_at DESC);

ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: pipeline_steps
-- Each individual stage within a pipeline run.
-- Pipeline flow: explore -> translate -> select -> expand -> refine
-- ============================================================

CREATE TABLE public.pipeline_steps (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_run_id uuid        NOT NULL REFERENCES public.pipeline_runs(id) ON DELETE CASCADE,
    step            text        NOT NULL,
    status          text        NOT NULL DEFAULT 'pending',
    started_at      timestamptz,
    completed_at    timestamptz,
    input_data      jsonb       NOT NULL DEFAULT '{}',
    output_data     jsonb       NOT NULL DEFAULT '{}',
    error_message   text,
    logs            jsonb       NOT NULL DEFAULT '[]',

    CONSTRAINT pipeline_steps_step_check   CHECK (step IN ('explore', 'translate', 'select', 'expand', 'refine')),
    CONSTRAINT pipeline_steps_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

CREATE INDEX idx_pipeline_steps_pipeline_run_id ON public.pipeline_steps (pipeline_run_id);
CREATE INDEX idx_pipeline_steps_step            ON public.pipeline_steps (step);

ALTER TABLE public.pipeline_steps ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: news_items
-- News collected by the pipeline during each run.
-- ============================================================

CREATE TABLE public.news_items (
    id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_run_id   uuid        NOT NULL REFERENCES public.pipeline_runs(id) ON DELETE CASCADE,
    pipeline_step_id  uuid        REFERENCES public.pipeline_steps(id) ON DELETE SET NULL,
    title             text        NOT NULL,
    original_url      text,
    summary           text,
    relevance_score   numeric(3,1) DEFAULT 0,
    category          text,
    is_selected       boolean     NOT NULL DEFAULT false,
    confidence_level  text        NOT NULL DEFAULT 'medium',
    time_horizon      text,
    source_id         uuid        REFERENCES public.sources(id) ON DELETE SET NULL,
    metadata          jsonb       NOT NULL DEFAULT '{}',
    created_at        timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT news_items_relevance_score_check  CHECK (relevance_score BETWEEN 0 AND 10),
    CONSTRAINT news_items_category_check         CHECK (category IN ('tecnologia', 'negocios', 'criacao')),
    CONSTRAINT news_items_confidence_level_check CHECK (confidence_level IN ('high', 'medium', 'low')),
    CONSTRAINT news_items_time_horizon_check     CHECK (time_horizon IN ('immediate', 'short', 'medium'))
);

CREATE INDEX idx_news_items_pipeline_run_id ON public.news_items (pipeline_run_id);
CREATE INDEX idx_news_items_is_selected     ON public.news_items (is_selected);
CREATE INDEX idx_news_items_category        ON public.news_items (category);

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: news_sources
-- Additional sources found during the expansion step for each
-- selected news item.
-- ============================================================

CREATE TABLE public.news_sources (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    news_item_id    uuid        NOT NULL REFERENCES public.news_items(id) ON DELETE CASCADE,
    url             text,
    title           text,
    type            text,
    content_summary text,
    data_points     jsonb       NOT NULL DEFAULT '{}',
    created_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT news_sources_type_check CHECK (type IN ('article', 'statistic', 'report', 'official_statement'))
);

CREATE INDEX idx_news_sources_news_item_id ON public.news_sources (news_item_id);

ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: reports
-- Reports generated by the pipeline (one per weekly run).
-- ============================================================

CREATE TABLE public.reports (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_run_id uuid        REFERENCES public.pipeline_runs(id) ON DELETE SET NULL,
    title           text        NOT NULL,
    slug            text        NOT NULL UNIQUE,
    status          text        NOT NULL DEFAULT 'draft',
    week_start      date        NOT NULL,
    week_end        date        NOT NULL,
    markdown_content text,
    published_at    timestamptz,
    reviewed_by     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_notes    text,
    metadata        jsonb       NOT NULL DEFAULT '{}',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT reports_status_check CHECK (status IN ('draft', 'in_review', 'approved', 'published'))
);

CREATE INDEX idx_reports_status       ON public.reports (status);
CREATE INDEX idx_reports_published_at ON public.reports (published_at DESC);
CREATE INDEX idx_reports_week_start   ON public.reports (week_start);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_reports
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABLE: report_sections
-- Individual sections that compose a report.
-- ============================================================

CREATE TABLE public.report_sections (
    id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id   uuid    NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    section_key text    NOT NULL,
    title       text    NOT NULL,
    content     text,
    order_index integer NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT report_sections_section_key_check CHECK (
        section_key IN (
            'executive_summary',
            'news_radar',
            'connections',
            'insights',
            'blind_spots',
            'opportunities',
            'threats',
            'weekly_watchlist'
        )
    ),
    CONSTRAINT report_sections_order_index_check CHECK (order_index BETWEEN 1 AND 8),
    CONSTRAINT report_sections_report_id_section_key_key UNIQUE (report_id, section_key)
);

CREATE INDEX idx_report_sections_report_id ON public.report_sections (report_id);

ALTER TABLE public.report_sections ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_report_sections
  BEFORE UPDATE ON public.report_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABLE: report_views
-- Basic reading analytics: tracks which users viewed which
-- reports and sections, and for how long.
-- ============================================================

CREATE TABLE public.report_views (
    id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id          uuid        NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id            uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
    section_key        text,
    viewed_at          timestamptz NOT NULL DEFAULT now(),
    time_spent_seconds integer     DEFAULT 0,
    metadata           jsonb       NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_report_views_report_id ON public.report_views (report_id);
CREATE INDEX idx_report_views_user_id   ON public.report_views (user_id);
CREATE INDEX idx_report_views_viewed_at ON public.report_views (viewed_at DESC);

ALTER TABLE public.report_views ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: refiner_feedback
-- Tracks editorial feedback and edits on report sections.
-- ============================================================

CREATE TABLE public.refiner_feedback (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id        uuid        NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    section_key      text        NOT NULL,
    original_content text,
    edited_content   text,
    review_notes     text,
    feedback_type    text        NOT NULL DEFAULT 'edit',
    created_by       uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_refiner_feedback_report_id   ON public.refiner_feedback (report_id);
CREATE INDEX idx_refiner_feedback_section_key ON public.refiner_feedback (section_key);

ALTER TABLE public.refiner_feedback ENABLE ROW LEVEL SECURITY;
