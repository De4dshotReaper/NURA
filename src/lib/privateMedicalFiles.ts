import { supabase } from './supabase';

export type MedicalFileBucket = 'prescriptions' | 'lab-reports';

const safeFileName = (fileName: string) => {
  const sanitized = fileName.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return sanitized || 'uploaded-file';
};

export const uploadPrivateMedicalFile = async (
  bucket: MedicalFileBucket,
  userId: string,
  file: File,
) => {
  const storagePath = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: '3600',
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  return storagePath;
};

export const createPrivateMedicalFileUrl = async (bucket: MedicalFileBucket, storagePath: string) => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 60);
  if (error || !data?.signedUrl) throw error ?? new Error('Signed URL was not returned.');
  return data.signedUrl;
};

export const downloadPrivateMedicalFile = async (
  bucket: MedicalFileBucket,
  storagePath: string,
  fileName: string,
) => {
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error || !data) throw error ?? new Error('File data was not returned.');

  const objectUrl = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

export const removePrivateMedicalFile = async (bucket: MedicalFileBucket, storagePath: string) => {
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error && !/not found|does not exist/i.test(error.message)) throw error;
};
