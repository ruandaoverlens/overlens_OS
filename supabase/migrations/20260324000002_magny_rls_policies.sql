-- Migration: 20260324000002_magny_rls_policies
-- Description: Defines all Row Level Security policies for Magny tables.
--              RLS was enabled on all tables in migration 20260324000001.
--
-- Role definitions:
--   admin  — full access to everything
--   member — authenticated user with a profile row; read-only access to published content
--
-- The service role (used by the pipeline) bypasses RLS entirely in Supabase,
-- so no INSERT/UPDATE policies are needed for pipeline-managed tables.

-- ============================================================
-- TABLE: reports
-- ============================================================

-- Members: read published reports only
CREATE POLICY "reports_member_select_published"
    ON public.reports
    FOR SELECT
    TO authenticated
    USING (
        status = 'published'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Public/anon: read published reports (for public report pages)
CREATE POLICY "reports_public_select_published"
    ON public.reports
    FOR SELECT
    USING (status = 'published');

-- Admin: read all reports (any status)
CREATE POLICY "reports_admin_select_all"
    ON public.reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin: update reports (review, approve, publish, edit)
CREATE POLICY "reports_admin_update"
    ON public.reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- TABLE: report_sections
-- ============================================================

-- Members: read sections that belong to a published report
CREATE POLICY "report_sections_member_select_published"
    ON public.report_sections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.reports
            WHERE reports.id = report_sections.report_id
              AND reports.status = 'published'
        )
    );

-- Public/anon: read sections of published reports
CREATE POLICY "report_sections_public_select_published"
    ON public.report_sections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.reports
            WHERE reports.id = report_sections.report_id
              AND reports.status = 'published'
        )
    );

-- Admin: read all sections regardless of report status
CREATE POLICY "report_sections_admin_select_all"
    ON public.report_sections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin: update sections
CREATE POLICY "report_sections_admin_update"
    ON public.report_sections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- TABLE: sources
-- ============================================================

-- Admin: full management (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "sources_admin_select"
    ON public.sources
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "sources_admin_insert"
    ON public.sources
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "sources_admin_update"
    ON public.sources
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "sources_admin_delete"
    ON public.sources
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- TABLE: pipeline_runs
-- ============================================================

-- Admin: view pipeline runs (service role handles inserts/updates)
CREATE POLICY "pipeline_runs_admin_select"
    ON public.pipeline_runs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- TABLE: pipeline_steps
-- ============================================================

-- Admin: view pipeline steps (service role handles inserts/updates)
CREATE POLICY "pipeline_steps_admin_select"
    ON public.pipeline_steps
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- TABLE: news_items
-- ============================================================

-- Admin: view news items (service role handles inserts/updates)
CREATE POLICY "news_items_admin_select"
    ON public.news_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- TABLE: news_sources
-- ============================================================

-- Admin: view news sources (service role handles inserts)
CREATE POLICY "news_sources_admin_select"
    ON public.news_sources
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- TABLE: report_views
-- ============================================================

-- Admin: view all analytics
CREATE POLICY "report_views_admin_select"
    ON public.report_views
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Any authenticated user can insert their own views
CREATE POLICY "report_views_user_insert"
    ON public.report_views
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: refiner_feedback
-- ============================================================

-- Admin: full access to feedback
CREATE POLICY "refiner_feedback_admin_all"
    ON public.refiner_feedback
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
