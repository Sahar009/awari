"use client";
import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { FileUpload } from "./ui/FileUpload";
import { Select } from "./ui/Select";
import { Shield, CheckCircle, AlertCircle, Upload, Info, Loader2 } from "lucide-react";
import { KycService } from "../services/kycService";
import clsx from "clsx";

interface KycFormData {
  documentType: string;
  documentNumber: string;
  expiresAt: string;
  document: File | null;
}

interface KycUploadFormProps {
  onSubmit?: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  onPreviewChange?: (file: File | null, previewUrl: string | null) => void;
}

const DOCUMENT_TYPES = [
  { value: "passport", label: "National Passport" },
  { value: "national_id", label: "National Identity" },
  { value: "drivers_license", label: "Driver's License" },
];

export const KycUploadForm: React.FC<KycUploadFormProps> = ({
  onSubmit,
  isLoading = false,
  onPreviewChange,
}) => {
  const [formData, setFormData] = useState<KycFormData>({
    documentType: "",
    documentNumber: "",
    expiresAt: "",
    document: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof KycFormData, string>>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof KycFormData, string>> = {};

    if (!formData.documentType) {
      newErrors.documentType = "Document type is required";
    }

    if (!formData.document) {
      newErrors.document = "Document file is required";
    }

    if (formData.documentType && ["passport", "national_id", "drivers_license"].includes(formData.documentType)) {
      if (!formData.documentNumber) {
        newErrors.documentNumber = "Document number is required for this document type";
      }
      if (!formData.expiresAt) {
        newErrors.expiresAt = "Expiration date is required for this document type";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus("error");
      return;
    }

    if (!onSubmit) return;

    try {
      const submitFormData = new FormData();
      submitFormData.append("documentType", formData.documentType);
      
      if (formData.document) {
        submitFormData.append("document", formData.document);
      }
      
      if (formData.documentNumber) {
        submitFormData.append("documentNumber", formData.documentNumber);
      }
      
      if (formData.expiresAt) {
        submitFormData.append("expiresAt", formData.expiresAt);
      }

      await onSubmit(submitFormData);
      setSubmitStatus("success");
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          documentType: "",
          documentNumber: "",
          expiresAt: "",
          document: null,
        });
        setSubmitStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("KYC submission error:", error);
      setSubmitStatus("error");
    }
  };

  const handleDocumentSelect = (files: File[]) => {
    const file = files[0];
    if (file) {
      const validation = KycService.validateFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, document: validation.error }));
        onPreviewChange?.(null, null);
        return;
      }
      
      // Create preview URL for parent component
      const previewUrl = URL.createObjectURL(file);
      onPreviewChange?.(file, previewUrl);
    } else {
      onPreviewChange?.(null, null);
    }
    
    setFormData(prev => ({ ...prev, document: file || null }));
    if (errors.document) {
      setErrors(prev => ({ ...prev, document: undefined }));
    }
  };


  const requiresAdditionalInfo = ["passport", "national_id", "drivers_license"].includes(formData.documentType);
  const documentRequirements = formData.documentType ? KycService.getDocumentRequirements(formData.documentType) : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Document Upload</h1>
        <p className="text-gray-600">
          Upload your identity documents to verify your account and ensure secure transactions.
        </p>
      </div>

      {/* Success Message */}
      {submitStatus === "success" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fadeInUp">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-medium text-green-800">Document Submitted Successfully!</h3>
            <p className="text-sm text-green-600">Your KYC document has been uploaded and is being reviewed.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === "error" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Submission Failed</h3>
            <p className="text-sm text-red-600">Please check your information and try again.</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Document Type Selection */}
          <div className="mb-6">
            <Select
              label="Document Type"
              required
              value={formData.documentType}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, documentType: e.target.value }));
                if (errors.documentType) {
                  setErrors(prev => ({ ...prev, documentType: undefined }));
                }
              }}
              error={errors.documentType}
              className="w-full"
            >
              <option value="">Select document type</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Document Requirements Info */}
          {documentRequirements && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Document Requirements</h3>
                  <p className="text-sm text-blue-700">{documentRequirements.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information (for ID documents) */}
          {requiresAdditionalInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Input
                  label="Document Number"
                  required
                  placeholder="Enter document number"
                  value={formData.documentNumber}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, documentNumber: e.target.value }));
                    if (errors.documentNumber) {
                      setErrors(prev => ({ ...prev, documentNumber: undefined }));
                    }
                  }}
                  error={errors.documentNumber}
                  maxLength={100}
                />
              </div>
              <div>
                <Input
                  label="Expiration Date"
                  type="date"
                  required
                  value={formData.expiresAt}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, expiresAt: e.target.value }));
                    if (errors.expiresAt) {
                      setErrors(prev => ({ ...prev, expiresAt: undefined }));
                    }
                  }}
                  error={errors.expiresAt}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          {/* Document Upload */}
          <div className="mb-8">
            <FileUpload
              label="Document File"
              required
              accept=".jpg,.jpeg,.png"
              maxSize={10}
              onFileSelect={handleDocumentSelect}
              error={errors.document}
              helperText="Upload a clear photo or scan of your document (JPG, PNG up to 10MB)"
            />
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Security & Privacy</h3>
                <p className="text-sm text-gray-600">
                  Your documents are encrypted and stored securely. We only use this information for identity verification 
                  and comply with all data protection regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || submitStatus === "success"}
            className={clsx(
              "w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
              isLoading 
                ? "bg-primary/80 text-white cursor-not-allowed"
                : submitStatus === "success"
                ? "bg-green-600 hover:bg-green-600 text-white"
                : "bg-primary text-white hover:bg-primary/90",
              (isLoading || submitStatus === "success") && "cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : submitStatus === "success" ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Document Uploaded!
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help? Contact our support team for assistance with document upload.
        </p>
      </div>
    </div>
  );
};
