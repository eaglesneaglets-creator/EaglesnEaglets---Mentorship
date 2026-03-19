// src/modules/nest/hooks/useUploadMedia.js
import { useState } from 'react';
import { tokenManager } from '@api';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Uploads a file to /nests/upload/ using XHR for real progress reporting.
 * Returns { upload, progress, isUploading, reset }.
 * upload(file) returns a Promise that resolves to { url, type }.
 */
export const useUploadMedia = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const reset = () => {
    setProgress(0);
    setIsUploading(false);
  };

  const upload = (file) =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/nests/upload/`);

      const token = tokenManager.getAccessToken();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 201) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error('Invalid server response'));
          }
        } else {
          let msg = 'Upload failed. Please try again.';
          try {
            const body = JSON.parse(xhr.responseText);
            if (body?.error) msg = body.error;
          } catch { /* ignore */ }
          toast.error(msg);
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error('Upload failed. Please try again.');
        reject(new Error('Network error during upload'));
      };

      setIsUploading(true);
      setProgress(0);
      xhr.send(formData);
    });

  return { upload, progress, isUploading, reset };
};
