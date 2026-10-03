INSERT INTO public.feature_prices (key, label, kind, price, days, weight, sort) VALUES
  ('responsive_design', 'Responsive mobile design', 'feature', 9000, 2, 2, 101),
  ('seo_basics', 'Basic SEO setup', 'feature', 7000, 1, 1, 102),
  ('hosting_domain_setup', 'Hosting & domain setup', 'feature', 5000, 1, 1, 103),
  ('ssl_security', 'SSL certificate & security hardening', 'feature', 4000, 1, 1, 104),
  ('analytics_setup', 'Analytics & visitor tracking', 'feature', 4000, 1, 1, 105),
  ('performance_optimization', 'Speed & performance optimization', 'feature', 8000, 2, 2, 106),
  ('content_pages', 'Core content pages (About, Services, FAQ)', 'feature', 10000, 2, 1, 107),
  ('social_links', 'Social media integration', 'feature', 3000, 1, 1, 108)
ON CONFLICT (key) DO NOTHING;