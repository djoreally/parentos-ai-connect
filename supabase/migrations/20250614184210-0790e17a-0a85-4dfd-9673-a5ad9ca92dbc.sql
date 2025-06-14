
-- Create a storage bucket for documents
insert into storage.buckets
  (id, name, public)
values
  ('documents', 'documents', true);

-- Add Row Level Security policies for the documents bucket

-- Allow authenticated users to view files in the 'documents' bucket.
CREATE POLICY "Allow authenticated SELECT on documents"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'documents' );

-- Allow authenticated users to upload files to the 'documents' bucket.
CREATE POLICY "Allow authenticated INSERT on documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'documents' );

-- Allow authenticated users to update files in the 'documents' bucket.
CREATE POLICY "Allow authenticated UPDATE on documents"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'documents' );

-- Allow authenticated users to delete files from the 'documents' bucket.
CREATE POLICY "Allow authenticated DELETE on documents"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'documents' );
