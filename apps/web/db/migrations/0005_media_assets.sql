CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blob_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    size_bytes INT NOT NULL,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster retrieval when sorting by creation date
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at DESC);
