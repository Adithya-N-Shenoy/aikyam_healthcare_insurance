'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { Camera, AlertCircle } from 'lucide-react';

interface RoomPhotoUploadProps {
  onPhotoUploaded: (file: File) => void;
  onPhotoRemoved?: () => void;
  value?: File | null;
}

export function RoomPhotoUpload({ onPhotoUploaded, onPhotoRemoved, value }: RoomPhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    onPhotoUploaded(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        label="Patient Room Photo"
        description="Upload a clear photo of the patient in the room as proof of admission"
        onFileUpload={handleUpload}
        onFileRemove={handleRemove}
        value={value}
        accept={{
          'image/*': ['.png', '.jpg', '.jpeg']
        }}
      />

      {/* Fraud Prevention Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <Camera className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Fraud Prevention Measure</p>
            <p className="text-xs text-yellow-700 mt-1">
              This photo is required to verify the patient's actual room type. 
              It helps prevent fraudulent claims where hospitals might claim for ICU/Private rooms 
              when patient was in General Ward.
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!preview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Photo Guidelines</p>
              <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                <li>Ensure patient is clearly visible in the photo</li>
                <li>Show the room environment (bed, facilities, etc.)</li>
                <li>Photo should be taken during the admission period</li>
                <li>Good lighting and clear image quality</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Photo Preview:</p>
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img src={preview} alt="Room preview" className="w-full h-auto max-h-96 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}