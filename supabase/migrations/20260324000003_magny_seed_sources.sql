-- Migration: 20260324000003_magny_seed_sources
-- Description: Seeds the sources table with RSS feeds organized by the 3 pilares:
--              tecnologia, negocios, criacao.

-- ============================================================
-- TECNOLOGIA (AI + Technology)
-- ============================================================
INSERT INTO public.sources (name, type, url, category, reliability_score, is_active) VALUES
  ('MIT Technology Review',             'rss', 'https://www.technologyreview.com/feed/',                               'tecnologia', 9, true),
  ('OpenAI Blog',                       'rss', 'https://openai.com/blog/rss.xml',                                     'tecnologia', 9, true),
  ('Google AI Blog',                    'rss', 'https://blog.google/technology/ai/rss/',                               'tecnologia', 9, true),
  ('Anthropic Blog',                    'rss', 'https://www.anthropic.com/rss.xml',                                    'tecnologia', 9, true),
  ('DeepMind Blog',                     'rss', 'https://deepmind.google/blog/rss.xml',                                'tecnologia', 9, true),
  ('NVIDIA Blog',                       'rss', 'https://blogs.nvidia.com/feed/',                                      'tecnologia', 8, true),
  ('Ars Technica',                      'rss', 'https://feeds.arstechnica.com/arstechnica/index',                     'tecnologia', 8, true),
  ('Wired',                             'rss', 'https://www.wired.com/feed/rss',                                      'tecnologia', 8, true),
  ('The Verge',                         'rss', 'https://www.theverge.com/rss/index.xml',                              'tecnologia', 7, true),
  ('TechCrunch AI',                     'rss', 'https://techcrunch.com/category/artificial-intelligence/feed/',        'tecnologia', 7, true),
  ('MIT News - Artificial Intelligence','rss', 'https://news.mit.edu/rss/topic/artificial-intelligence2',              'tecnologia', 8, true),
  ('MIT News - Computer Science',       'rss', 'https://news.mit.edu/rss/topic/computers',                            'tecnologia', 8, true),
  ('Simon Willison Blog',               'rss', 'https://simonwillison.net/atom/everything/',                          'tecnologia', 8, true),
  ('Benedict Evans',                    'rss', 'https://www.ben-evans.com/feed',                                      'tecnologia', 8, true),
  ('OpenAI Search',                     'api', 'https://api.openai.com',                                              'tecnologia', 8, true);

-- ============================================================
-- NEGOCIOS (Business + Strategy)
-- ============================================================
INSERT INTO public.sources (name, type, url, category, reliability_score, is_active) VALUES
  ('Harvard Business Review',           'rss', 'https://hbr.org/feed',                                                'negocios', 9, true),
  ('McKinsey & Company',                'rss', 'https://www.mckinsey.com/rss/insights',                               'negocios', 9, true),
  ('a16z Blog',                         'rss', 'https://a16z.com/feed/',                                              'negocios', 9, true),
  ('Stratechery',                       'rss', 'https://stratechery.com/feed/',                                       'negocios', 9, true),
  ('First Round Review',                'rss', 'https://review.firstround.com/feed.xml',                              'negocios', 8, true),
  ('Lenny''s Newsletter',               'rss', 'https://www.lennysnewsletter.com/feed',                               'negocios', 8, true);

-- ============================================================
-- CRIACAO (Design + Creation + Tools)
-- ============================================================
INSERT INTO public.sources (name, type, url, category, reliability_score, is_active) VALUES
  ('Figma Blog',                        'rss', 'https://www.figma.com/blog/feed/',                                    'criacao', 8, true),
  ('Adobe Blog',                        'rss', 'https://blog.adobe.com/en/publish/feed.xml',                          'criacao', 8, true),
  ('IDEO Blog',                         'rss', 'https://www.ideo.com/journal/feed',                                   'criacao', 8, true),
  ('The Pragmatic Engineer',            'rss', 'https://newsletter.pragmaticengineer.com/feed',                       'criacao', 9, true),
  ('Canva Newsroom',                    'rss', 'https://www.canva.com/newsroom/feed/',                                'criacao', 7, true),
  ('Product Hunt',                      'rss', 'https://www.producthunt.com/feed',                                    'criacao', 7, true),
  ('Indie Hackers',                     'rss', 'https://www.indiehackers.com/feed.xml',                               'criacao', 7, true),
  ('UX Collective',                     'rss', 'https://uxdesign.cc/feed',                                            'criacao', 7, true),
  ('Dense Discovery',                   'rss', 'https://www.densediscovery.com/feed',                                 'criacao', 7, true);

-- ============================================================
-- INSTAGRAM (reference only, not scraped)
-- ============================================================
INSERT INTO public.sources (name, type, url, category, reliability_score, is_active) VALUES
  ('@notjournal.ai',                    'instagram', 'https://instagram.com/notjournal.ai',                            'tecnologia', 5, false),
  ('@brmetaverso',                      'instagram', 'https://instagram.com/brmetaverso',                              'tecnologia', 5, false),
  ('@uncover.ai',                       'instagram', 'https://instagram.com/uncover.ai',                               'tecnologia', 5, false),
  ('@wired',                            'instagram', 'https://instagram.com/wired',                                    'tecnologia', 5, false);
