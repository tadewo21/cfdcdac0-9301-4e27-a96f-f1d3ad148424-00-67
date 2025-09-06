-- Create a public bucket for company logos
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);

-- Create RLS policies for company logos
CREATE POLICY "Company logos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload company logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update company logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'company-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete company logos" ON storage.objects
FOR DELETE USING (bucket_id = 'company-logos' AND auth.uid() IS NOT NULL);