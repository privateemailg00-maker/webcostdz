CREATE TABLE public.ai_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_slug text NOT NULL UNIQUE,
  questions_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_questions TO service_role;
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type text NOT NULL,
  answers_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  features_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  minimum_price integer NOT NULL DEFAULT 0,
  maximum_price integer NOT NULL DEFAULT 0,
  duration text,
  complexity text,
  summary text,
  analysis_json jsonb,
  full_name text,
  company text,
  email text,
  phone text,
  project_details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.estimates TO service_role;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;