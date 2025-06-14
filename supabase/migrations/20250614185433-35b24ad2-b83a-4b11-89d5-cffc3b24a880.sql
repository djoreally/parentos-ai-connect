
-- Drop the old policy that only allows authenticated users to read files.
DROP POLICY "Allow authenticated SELECT on documents" ON storage.objects;

-- Create a new policy to allow public read access for all files in the 'documents' bucket.
-- This is necessary for the <audio> tag to fetch and play the recordings.
CREATE POLICY "Public Read Access for Documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );
