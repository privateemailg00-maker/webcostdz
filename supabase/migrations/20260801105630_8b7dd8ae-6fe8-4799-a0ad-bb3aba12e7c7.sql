CREATE TABLE public.feature_prices (
  key text PRIMARY KEY,
  label text NOT NULL,
  kind text NOT NULL DEFAULT 'feature',
  price integer NOT NULL DEFAULT 0,
  days integer NOT NULL DEFAULT 1,
  weight integer NOT NULL DEFAULT 1,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.feature_prices TO service_role;

ALTER TABLE public.feature_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to feature prices"
ON public.feature_prices FOR SELECT TO authenticated USING (false);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_feature_prices_updated_at
BEFORE UPDATE ON public.feature_prices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.feature_prices (key, label, kind, price, days, weight, sort) VALUES
('landing_page','Landing Page','feature',120,2,1,1),
('authentication','Authentication','feature',180,3,2,2),
('admin_dashboard','Admin Dashboard','feature',350,5,3,3),
('cms','CMS','feature',250,4,3,4),
('blog','Blog','feature',120,2,1,5),
('booking_system','Booking System','feature',280,4,3,6),
('reservation_calendar','Reservation Calendar','feature',200,3,2,7),
('online_payments','Online Payments','feature',220,3,3,8),
('inventory_management','Inventory Management','feature',400,6,4,9),
('pos_system','POS System','feature',500,8,5,10),
('order_management','Order Management','feature',220,3,3,11),
('notifications','Notifications','feature',100,2,1,12),
('analytics_dashboard','Analytics Dashboard','feature',180,3,2,13),
('file_upload','File Upload','feature',100,1,1,14),
('customer_accounts','Customer Accounts','feature',150,2,2,15),
('reviews','Reviews','feature',80,1,1,16),
('chat','Chat','feature',150,2,2,17),
('multilingual','Multilingual','feature',180,3,2,18),
('seo','SEO','feature',120,2,1,19),
('contact_form','Contact Form','feature',50,1,1,20),
('google_maps','Google Maps','feature',50,1,1,21),
('multiple_branches','Multiple Branches','feature',300,4,3,22),
('api_integration','API Integration','feature',250,4,3,23),
('managed_backend','No-code / Managed Backend','backend',150,2,1,30),
('custom_backend','Custom Coded Backend','backend',450,6,4,31),
('mobile_app','Mobile App','addon',2000,0,0,40),
('ai_chatbot','AI Chatbot','addon',500,0,0,41),
('sms_notifications','SMS Notifications','addon',250,0,0,42),
('loyalty_program','Loyalty Program','addon',400,0,0,43),
('advanced_seo','Advanced SEO Package','addon',350,0,0,44);