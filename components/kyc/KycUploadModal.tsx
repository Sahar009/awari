"use client";

import React, { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { uploadKycDocument, selectUploadProgress } from '@/store/slices/kycSlice';
import { KycService } from '@/services/kycService';
import { useToast } from '@/components/ui/useToast';
import { 
  X, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Camera,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';
import Image from 'next/image';

interface KycUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DocumentFormData {
  documentType: string;
  documentNumber: string;
  expiresAt: string;
}

const documentTypes = [
  { 
    value: 'national_id', 
    label: 'National ID (NIN)', 
    description: 'Upload both front and back of your national ID card',
    icon: '🆔',
    category: 'identity'
  },
  { 
    value: 'drivers_license', 
    label: "Driver's License", 
    description: 'Upload both front and back of your driver\'s license',
    icon: '🚗',
    category: 'identity'
  },
  { 
    value: 'passport', 
    label: 'International Passport', 
    description: 'Upload a clear photo of your passport information page',
    icon: '📘',
    category: 'identity'
  },
  { 
    value: 'utility_bill', 
    label: 'Utility Bill', 
    description: 'Upload a recent utility bill (electricity, water, gas)',
    icon: '⚡',
    category: 'address'
  },
  { 
    value: 'bank_statement', 
    label: 'Bank Statement', 
    description: 'Upload a recent bank statement (last 3 months)',
    icon: '🏦',
    category: 'financial'
  },
  { 
    value: 'employment_letter', 
    label: 'Employment Letter', 
    description: 'Upload your employment letter from your employer',
    icon: '💼',
    category: 'employment'
  },
  { 
    value: 'tax_document', 
    label: 'Tax Document', 
    description: 'Upload your tax document or certificate',
    icon: '📊',
    category: 'financial'
  },
];

export const KycUploadModal: React.FC<KycUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    documentType: '',
    documentNumber: '',
    expiresAt: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const totalSteps = 2;

  const uploadProgress = useAppSelector(selectUploadProgress);

  // Get document requirements
  const documentRequirements = formData.documentType 
    ? KycService.getDocumentRequirements(formData.documentType)
    : null;

  const handleFileSelect = (file: File) => {
    // Validate file
    const validation = KycService.validateFile(file, 10);
    if (!validation.isValid) {
      setErrors({ file: validation.error || 'Invalid file' });
      return;
    }

    // Clear previous errors
    setErrors(prev => ({ ...prev, file: '' }));

    // Set file and create preview
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.documentType) {
        newErrors.documentType = 'Please select a document type';
      }
    }

    if (step === 2) {
      if (documentRequirements?.requiresNumber && !formData.documentNumber.trim()) {
        newErrors.documentNumber = 'Document number is required';
      }

      if (documentRequirements?.requiresExpiry && !formData.expiresAt) {
        newErrors.expiresAt = 'Expiry date is required';
      }

      if (!selectedFile) {
        newErrors.file = 'Please select a file to upload';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    return validateStep(1) && validateStep(2);
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setErrors({}); // Clear errors when moving to next step
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({}); // Clear errors when going back
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for upload
      const uploadFormData = new FormData();
      uploadFormData.append('document', selectedFile!);
      uploadFormData.append('documentType', formData.documentType);
      
      if (formData.documentNumber) {
        uploadFormData.append('documentNumber', formData.documentNumber);
      }
      
      if (formData.expiresAt) {
        uploadFormData.append('expiresAt', formData.expiresAt);
      }

      // Upload document
      await dispatch(uploadKycDocument(uploadFormData)).unwrap();
      
      toast.success('Success', 'Document uploaded successfully');
      
      // Reset form
      resetForm();
      
      // Close modal and call success callback
      onClose();
      onSuccess?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      toast.error('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      documentType: '',
      documentNumber: '',
      expiresAt: ''
    });
    setErrors({});
    removeFile();
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload KYC Document</h2>
            {/* Step Progress */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, index) => (
                <React.Fragment key={index}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    index + 1 <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1 < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < totalSteps - 1 && (
                    <div className={`h-1 w-8 rounded-full ${
                      index + 1 < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Step {currentStep} of {totalSteps}: {currentStep === 1 ? 'Select Document Type' : 'Upload Document'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Document Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Document Type *
                </label>
            
            {/* Group documents by category */}
            {['identity', 'address', 'financial', 'employment'].map(category => {
              const categoryDocs = documentTypes.filter(doc => doc.category === category);
              if (categoryDocs.length === 0) return null;
              
              const categoryLabels = {
                identity: 'Identity Documents',
                address: 'Address Verification',
                financial: 'Financial Documents',
                employment: 'Employment Documents'
              };
              
              return (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryDocs.map((type) => (
                      <label
                        key={type.value}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                          formData.documentType === type.value
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="documentType"
                          value={type.value}
                          checked={formData.documentType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{type.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{type.label}</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{type.description}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                            formData.documentType === type.value
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}>
                            {formData.documentType === type.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            
                {errors.documentType && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.documentType}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Document Details and Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Document Type Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">
                      {documentTypes.find(doc => doc.value === formData.documentType)?.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">
                      {documentTypes.find(doc => doc.value === formData.documentType)?.label}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {documentTypes.find(doc => doc.value === formData.documentType)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Number (if required) */}
              {documentRequirements?.requiresNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Number *
                  </label>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter document number"
                  />
                  {errors.documentNumber && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.documentNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Expiry Date (if required) */}
              {documentRequirements?.requiresExpiry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.expiresAt && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.expiresAt}
                    </p>
                  )}
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Document Image *
                </label>
            
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload your document</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG, PDF, WebP (Max 10MB)
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Document preview"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={isUploading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
                {errors.file && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.file}
                  </p>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Uploading document...</p>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step Navigation */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!formData.documentType}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {currentStep === 2 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isUploading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default KycUploadModal;
