-- Migration: 20260324000004_magny_illustrate
-- Description: Adds cover_image_url to reports table and updates pipeline_steps
--              constraint to include the new 'illustrate' step.

-- 1. Add cover_image_url column to reports
ALTER TABLE public.reports
  ADD COLUMN cover_image_url text;

-- 2. Update pipeline_steps step constraint to include 'illustrate'
ALTER TABLE public.pipeline_steps
  DROP CONSTRAINT pipeline_steps_step_check;

ALTER TABLE public.pipeline_steps
  ADD CONSTRAINT pipeline_steps_step_check
    CHECK (step IN ('explore', 'translate', 'select', 'expand', 'refine', 'illustrate'));
