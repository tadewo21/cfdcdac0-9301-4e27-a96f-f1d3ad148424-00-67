-- Add missing education_level column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN education_level text;