'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Sparkles, Cloud, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    fileName: string;
  };
  error?: string;
}

interface FileUploadProps {
  onUploadSuccess?: (data: any) => void;
}

export const FileUpload = ({ onUploadSuccess }: FileUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Nur PDF- und Word-Dokumente sind erlaubt.';
    }

    if (file.size > maxSize) {
      return 'Die Datei ist zu groß. Maximum: 10MB.';
    }

    return null;
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result: UploadResponse = await response.json();

      if (result.success && result.data) {
        setSuccessMessage(`"${result.data.name || result.data.fileName}" wurde erfolgreich hochgeladen!`);
        setUploadedFiles(prev => [...prev, result.data]);
        onUploadSuccess?.(result.data);
        
        // Auto redirect after 2 seconds
        setTimeout(() => {
          router.push(`/candidate/${result.data!.id}`);
        }, 2000);
      } else {
        throw new Error(result.error || 'Upload fehlgeschlagen');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setErrorMessage(error instanceof Error ? error.message : 'Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    await uploadFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const clearMessage = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="space-y-8">
      {/* Upload Area - Exklusives Design */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept=".pdf,.doc,.docx"
          className="hidden"
          aria-label="CV-Datei hochladen"
          title="Wählen Sie eine CV-Datei zum Hochladen"
        />
        
        <div
          className={`
            relative w-full max-w-3xl mx-auto p-12 rounded-3xl border-2 border-dashed
            transition-all duration-500 cursor-pointer group overflow-hidden
            ${
              isDragActive
                ? 'border-gray-900 bg-gradient-to-br from-gray-900/10 to-gray-800/10 scale-[1.02] shadow-2xl'
                : isUploading
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/10 to-orange/10'
                : 'border-gray-300 hover:border-gray-900/50 bg-white hover:shadow-xl'
            }
          `}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {/* Background Animation - Exklusiv */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-gray-900/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-gray-700/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
            {/* Icon - Premium Design */}
            <div className="relative">
              <div className={`
                w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500
                ${
                  isDragActive
                    ? 'bg-gradient-to-br from-gray-900 to-gray-700 scale-110 shadow-2xl'
                    : isUploading
                    ? 'bg-gradient-to-br from-yellow-500 to-orange animate-pulse'
                    : 'bg-gradient-to-br from-gray-900 to-gray-800 group-hover:scale-110 group-hover:shadow-xl'
                }
              `}>
                {isUploading ? (
                  <Cloud className="w-12 h-12 text-white animate-bounce" />
                ) : isDragActive ? (
                  <Zap className="w-12 h-12 text-white" />
                ) : (
                  <Upload className="w-12 h-12 text-white" />
                )}
              </div>
              
              {isDragActive && (
                <div className="absolute -inset-4 border-2 border-gray-900 rounded-full animate-ping" />
              )}
            </div>

            {/* Text Content - Exklusiv */}
            <div className="space-y-4">
              <h3 className={`
                text-3xl font-bold transition-all duration-500
                ${
                  isDragActive
                    ? 'text-gray-900 scale-105'
                    : isUploading
                    ? 'text-yellow-600'
                    : 'text-gray-900 group-hover:text-gray-800'
                }
              `}>
                {isUploading
                  ? 'Wird verarbeitet...'
                  : isDragActive
                  ? 'Datei hier ablegen!'
                  : 'CV hochladen'
                }
              </h3>
              
              <p className={`
                text-lg transition-all duration-500
                ${
                  isDragActive
                    ? 'text-gray-800'
                    : isUploading
                    ? 'text-yellow-600'
                    : 'text-gray-700'
                }
              `}>
                {isUploading
                  ? 'Ihre Datei wird analysiert und pseudonymisiert...'
                  : isDragActive
                  ? 'Lassen Sie die Datei los, um sie hochzuladen'
                  : 'Drag & Drop oder klicken zum Hochladen'
                }
              </p>

              {!isUploading && !isDragActive && (
                <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-700">
                  <span className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-gray-300 shadow-sm">
                    <FileText className="h-4 w-4" />
                    PDF
                  </span>
                  <span className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-gray-300 shadow-sm">
                    <FileText className="h-4 w-4" />
                    DOC
                  </span>
                  <span className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-gray-300 shadow-sm">
                    <FileText className="h-4 w-4" />
                    DOCX
                  </span>
                  <span className="bg-gray-900 text-white px-3 py-2 rounded-xl font-medium shadow-lg">
                    Max. 10 MB
                  </span>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="w-full max-w-md space-y-3">
                <Progress 
                  value={uploadProgress} 
                  className="h-3 bg-gray-200"
                />
                <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  {Math.round(uploadProgress)}% abgeschlossen
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages - Premium Design */}
      {(errorMessage || successMessage) && (
        <div className={`
          max-w-2xl mx-auto p-6 rounded-2xl border-2 shadow-lg transition-all duration-500
          ${
            errorMessage
              ? 'bg-gradient-to-r from-red/5 to-orange/5 border-red/20'
              : 'bg-gradient-to-r from-green/5 to-emerald/5 border-green/20'
          }
        `}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center
                ${errorMessage ? 'bg-red/10' : 'bg-green/10'}
              `}>
                {errorMessage ? (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div className="space-y-2">
                <h4 className={`text-lg font-bold ${errorMessage ? 'text-red-600' : 'text-green-600'}`}>
                  {errorMessage ? 'Fehler beim Upload' : 'Upload erfolgreich!'}
                </h4>
                <p className={`${errorMessage ? 'text-red-700' : 'text-green-700'}`}>
                  {errorMessage || successMessage}
                </p>
                {successMessage && (
                  <p className="text-sm text-gray-700 flex items-center gap-2 mt-3">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    Sie werden automatisch zum pseudonymisierten Profil weitergeleitet...
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={clearMessage}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Nachricht schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Recently Uploaded Files - Premium Style */}
      {uploadedFiles.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Erfolgreich verarbeitet
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{file.name || file.fileName}</h4>
                    <p className="text-sm text-gray-600">Pseudonymisiert • DSGVO-konform</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/candidate/${file.id}`)}
                    className="px-3 py-1 rounded-xl border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-sm font-medium transition-colors duration-200"
                  >
                    Profil ansehen →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};