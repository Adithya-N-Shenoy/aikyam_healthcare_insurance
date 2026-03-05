'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onFileRemove?: () => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label: string;
  description?: string;
  error?: string;
  value?: File | null;
}

export default function FileUpload({
  onFileUpload,
  onFileRemove,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf']
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  label,
  description,
  error: externalError,
  value
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    // Handle rejections
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload PDF or image.');
      } else {
        setError(rejection.errors[0]?.message || 'Upload failed');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Validate size again
    if (file.size > maxSize) {
      setError(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setError(null);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileUpload(file);
    toast.success('File uploaded successfully');
  }, [maxSize, onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (onFileRemove) {
      onFileRemove();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      
      {!value && !preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isDragReject || error || externalError ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? (
              'Drop the file here...'
            ) : (
              <>
                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {description || 'PDF or Image (max 50MB)'}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preview ? (
                <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded" />
              ) : (
                <File className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {value?.name || 'Uploaded file'}
                </p>
                <p className="text-xs text-gray-500">
                  {(value?.size || 0) / 1024 < 1024 
                    ? `${Math.round((value?.size || 0) / 1024)} KB` 
                    : `${Math.round((value?.size || 0) / (1024 * 1024))} MB`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-gray-200 rounded-full transition"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {(error || externalError) && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error || externalError}
        </div>
      )}
    </div>
  );
}