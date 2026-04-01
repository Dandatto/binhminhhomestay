-- Add field for international data transfer consent (ND13/2023)
-- This field will become completely required once Legal reviews the text.
ALTER TABLE consent_logs 
ADD COLUMN IF NOT EXISTS consent_cross_border boolean NOT NULL DEFAULT false;
