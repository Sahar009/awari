// KYC Service for handling document uploads and API interactions
import { apiService, ApiResponse } from './api';

export interface KycDocumentResponse {
  id: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documentNumber?: string;
  expiresAt?: string;
  documentUrl?: string;
  thumbnailUrl?: string;
}

export interface KycUploadRequest {
  documentType: string;
  documentNumber?: string;
  expiresAt?: string;
}

export class KycService {
  /**
   * Upload KYC document
   */
  static async uploadDocument(formData: FormData): Promise<ApiResponse<KycDocumentResponse>> {
    return apiService.upload<KycDocumentResponse>('/kyc/upload', formData);
  }

  /**
   * Get KYC document status
   */
  static async getDocumentStatus(documentId: string): Promise<ApiResponse<KycDocumentResponse>> {
    return apiService.get<KycDocumentResponse>(`/kyc/documents/${documentId}`);
  }

  /**
   * Get all user's KYC documents
   */
  static async getUserDocuments(): Promise<ApiResponse<KycDocumentResponse[]>> {
    return apiService.get<KycDocumentResponse[]>('/kyc/documents');
  }

  /**
   * Delete KYC document
   */
  static async deleteDocument(documentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<{ message: string }>(`/kyc/documents/${documentId}`);
  }

  /**
   * Get KYC verification status
   */
  static async getVerificationStatus(): Promise<ApiResponse<{ 
    isVerified: boolean; 
    status: 'pending' | 'approved' | 'rejected';
    submittedDocuments: number;
    requiredDocuments: number;
  }>> {
    return apiService.get('/kyc/status');
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, maxSizeMB: number = 10): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported. Please upload JPG or PNG files only.',
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size too large. Maximum size is ${maxSizeMB}MB.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Get document type requirements
   */
  static getDocumentRequirements(documentType: string): {
    requiresNumber: boolean;
    requiresExpiry: boolean;
    description: string;
  } {
    const requirements = {
      passport: {
        requiresNumber: true,
        requiresExpiry: true,
        description: 'Upload a clear photo of your passport information page',
      },
      national_id: {
        requiresNumber: true,
        requiresExpiry: true,
        description: 'Upload both front and back of your national ID card',
      },
      drivers_license: {
        requiresNumber: true,
        requiresExpiry: true,
        description: 'Upload both front and back of your driver\'s license',
      },
    };

    return requirements[documentType as keyof typeof requirements] || {
      requiresNumber: false,
      requiresExpiry: false,
      description: 'Upload the required document',
    };
  }
}
