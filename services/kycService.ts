// KYC Service for handling document uploads and API interactions
import { apiService, ApiResponse } from './api';

export interface KycDocument {
  id: string;
  userId: string;
  documentType: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'employment_letter' | 'tax_document';
  documentNumber?: string;
  documentUrl: string;
  documentThumbnail?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  verifier?: any; // Additional field from API response
}

export interface KycDocumentResponse {
  success: boolean;
  message?: string;
  data: KycDocument;
}

export interface KycDocumentsListResponse {
  success: boolean;
  data: {
    documents: KycDocument[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface KycStatus {
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  submittedDocuments: number;
  requiredDocuments: number;
  isVerified: boolean;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface KycStatusResponse {
  success: boolean;
  data: KycStatus;
}

export interface CreateKycDocumentRequest {
  documentType: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'employment_letter' | 'tax_document';
  documentNumber?: string;
  documentUrl?: string;
  documentThumbnail?: string;
  expiresAt?: string;
}

export interface UpdateKycDocumentRequest {
  documentType?: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'employment_letter' | 'tax_document';
  documentNumber?: string;
  documentUrl?: string;
  documentThumbnail?: string;
  expiresAt?: string;
}

export class KycService {
  /**
   * Upload KYC document with file upload
   */
  static async uploadDocument(formData: FormData): Promise<ApiResponse<KycDocumentResponse>> {
    return apiService.upload<KycDocumentResponse>('/kyc/upload', formData);
  }

  /**
   * Create KYC document with URL
   */
  static async createDocument(data: CreateKycDocumentRequest): Promise<ApiResponse<KycDocumentResponse>> {
    return apiService.post<KycDocumentResponse>('/kyc', data);
  }

  /**
   * Get all user's KYC documents with pagination and filters
   */
  static async getUserDocuments(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected' | 'expired';
    documentType?: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'employment_letter' | 'tax_document';
  }): Promise<ApiResponse<KycDocumentsListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.documentType) queryParams.append('documentType', params.documentType);
    
    const url = `/kyc${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<KycDocumentsListResponse>(url);
  }

  /**
   * Get a specific KYC document by ID
   */
  static async getDocumentById(documentId: string): Promise<ApiResponse<KycDocumentResponse>> {
    return apiService.get<KycDocumentResponse>(`/kyc/${documentId}`);
  }

  /**
   * Update a KYC document
   */
  static async updateDocument(documentId: string, data: UpdateKycDocumentRequest): Promise<ApiResponse<KycDocumentResponse>> {
    return apiService.put<KycDocumentResponse>(`/kyc/${documentId}`, data);
  }

  /**
   * Delete a KYC document
   */
  static async deleteDocument(documentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<{ message: string }>(`/kyc/${documentId}`);
  }

  /**
   * Get KYC verification status (legacy endpoint - may need to be updated)
   */
  static async getVerificationStatus(): Promise<ApiResponse<KycStatusResponse>> {
    return apiService.get<KycStatusResponse>('/kyc/status');
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, maxSizeMB: number = 10): { isValid: boolean; error?: string } {
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'application/pdf',
      'image/webp'
    ];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported. Please upload JPG, PNG, PDF, or WebP files only.',
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
      utility_bill: {
        requiresNumber: false,
        requiresExpiry: false,
        description: 'Upload a recent utility bill (electricity, water, gas)',
      },
      bank_statement: {
        requiresNumber: false,
        requiresExpiry: false,
        description: 'Upload a recent bank statement (last 3 months)',
      },
      employment_letter: {
        requiresNumber: false,
        requiresExpiry: false,
        description: 'Upload your employment letter from your employer',
      },
      tax_document: {
        requiresNumber: false,
        requiresExpiry: false,
        description: 'Upload your tax document or certificate',
      },
    };

    return requirements[documentType as keyof typeof requirements] || {
      requiresNumber: false,
      requiresExpiry: false,
      description: 'Upload the required document',
    };
  }
}
