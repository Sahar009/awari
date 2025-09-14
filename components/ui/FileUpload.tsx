"use client";
import React, { useCallback, useState, useEffect } from "react";
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFileSelect: (files: File[]) => void;
  error?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
  maxSize = 10,
  onFileSelect,
  error,
  helperText,
  className,
  required = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} is too large (max ${maxSize}MB)`);
        return;
      }

      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (accept && !accept.includes(fileExtension)) {
        errors.push(`${file.name} is not a supported file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      console.error("File validation errors:", errors);
      return;
    }

    const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
    setSelectedFiles(newFiles);
    
    // Create preview URLs for image files
    const newPreviewUrls: string[] = [];
    newFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      } else {
        newPreviewUrls.push('');
      }
    });
    
    // Clean up old URLs
    previewUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    
    setPreviewUrls(newPreviewUrls);
    onFileSelect(newFiles);
  }, [accept, maxSize, multiple, selectedFiles, onFileSelect, previewUrls]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    // Clean up the preview URL for the removed file
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    onFileSelect(newFiles);
  }, [selectedFiles, previewUrls, onFileSelect]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <ImageIcon className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Cleanup effect to revoke object URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={clsx(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 cursor-pointer",
          dragActive
            ? "border-primary bg-primary/5"
            : error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 hover:border-primary hover:bg-gray-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={clsx("w-8 h-8 mb-2", error ? "text-red-500" : "text-gray-400")} />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mb-1">
            {accept.replace(/\./g, '').toUpperCase()} files up to {maxSize}MB
          </p>
          <p className="text-xs text-blue-600">
            💡 Tip: For faster uploads, keep files under 5MB
          </p>
        </div>
      </div>

      {/* Selected Files with Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg border p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      {file.size > 5 * 1024 * 1024 && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Large file - may take longer to upload
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              {/* Image Preview */}
              {previewUrls[index] && (
                <div className="mt-3">
                  <div className="relative group">
                    <img
                      src={previewUrls[index]}
                      alt={`Preview of ${file.name}`}
                      className="w-full max-w-md h-48 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        // Open image in new tab for full view
                        const newWindow = window.open();
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head><title>Document Preview - ${file.name}</title></head>
                              <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                                <img src="${previewUrls[index]}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" />
                              </body>
                            </html>
                          `);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full">
                        Click to view full size
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Click image to view in full size
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <span className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
};
