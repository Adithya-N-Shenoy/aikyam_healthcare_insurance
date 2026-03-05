import { useState } from 'react';
import toast from 'react-hot-toast';

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, bucketType: 'bills' | 'room-photos'): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Map to correct bucket name
      const bucket = bucketType === 'bills' ? 'bills' : 'room-photos';
      formData.append('bucket', bucket);

      console.log(`Uploading ${file.name} to ${bucket} bucket...`);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log('Upload successful, URL:', data.publicUrl);
      return data.publicUrl;

    } catch (err: any) {
      setError(err.message);
      toast.error(`Upload failed: ${err.message}`);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    error
  };
}