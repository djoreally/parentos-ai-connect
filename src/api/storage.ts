
import { supabase } from '@/integrations/supabase/client';

export const uploadDocument = async (file: File) => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;
  
  const { data, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw new Error('File upload failed.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(data.path);

  return { publicUrl, fileName: file.name };
};
