import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  KycService, 
  type KycDocument, 
  type KycStatus, 
  type CreateKycDocumentRequest,
  type UpdateKycDocumentRequest,
  type KycDocumentsListResponse,
  type KycDocumentResponse,
  type KycStatusResponse
} from '../../services/kycService';

export interface KycState {
  documents: KycDocument[];
  status: KycStatus | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;
}

// Initial state
const initialState: KycState = {
  documents: [],
  status: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
  pagination: null,
};

// Async thunks - Using kycService methods
export const fetchKycDocuments = createAsyncThunk(
  'kyc/fetchDocuments',
  async (params: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected' | 'expired';
    documentType?: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'employment_letter' | 'tax_document';
  } = {}, { rejectWithValue }) => {
    try {
      const response = await KycService.getUserDocuments(params);
      console.log('🔍 fetchKycDocuments - Full API response:', response);
      console.log('🔍 fetchKycDocuments - response.data:', response.data);
      
      // The API service returns ApiResponse<KycDocumentsListResponse>
      // So response.data is the KycDocumentsListResponse: { success: true, data: { documents: [], pagination: {} } }
      // We want to return the inner data object: { documents: [], pagination: {} }
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch KYC documents';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchKycStatus = createAsyncThunk(
  'kyc/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await KycService.getVerificationStatus();
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch KYC status';
      return rejectWithValue(errorMessage);
    }
  }
);

export const uploadKycDocument = createAsyncThunk(
  'kyc/uploadDocument',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await KycService.uploadDocument(formData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload KYC document';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createKycDocument = createAsyncThunk(
  'kyc/createDocument',
  async (data: CreateKycDocumentRequest, { rejectWithValue }) => {
    try {
      const response = await KycService.createDocument(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create KYC document';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateKycDocument = createAsyncThunk(
  'kyc/updateDocument',
  async ({ documentId, data }: { documentId: string; data: UpdateKycDocumentRequest }, { rejectWithValue }) => {
    try {
      const response = await KycService.updateDocument(documentId, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update KYC document';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getKycDocumentById = createAsyncThunk(
  'kyc/getDocumentById',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await KycService.getDocumentById(documentId);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch KYC document';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteKycDocument = createAsyncThunk(
  'kyc/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      await KycService.deleteDocument(documentId);
      return documentId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete KYC document';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch KYC Documents
    builder
      .addCase(fetchKycDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKycDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('🔍 fetchKycDocuments.fulfilled - action.payload:', action.payload);
        console.log('🔍 fetchKycDocuments.fulfilled - action.payload.documents:', action.payload.documents);
        console.log('🔍 fetchKycDocuments.fulfilled - action.payload.pagination:', action.payload.pagination);
        
        // action.payload is now the inner data object: { documents: [], pagination: {} }
        // Use type assertion to handle TypeScript inference issues
        const payload = action.payload as { documents: any[]; pagination: any };
        state.documents = payload.documents;
        state.pagination = payload.pagination;
        state.error = null;
      })
      .addCase(fetchKycDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch KYC Status
    builder
      .addCase(fetchKycStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKycStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = action.payload.data;
        state.error = null;
      })
      .addCase(fetchKycStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload KYC Document
    builder
      .addCase(uploadKycDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadKycDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        // action.payload is the KycDocument object directly
        state.documents.push(action.payload.data);
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(uploadKycDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      });

    // Create KYC Document
    builder
      .addCase(createKycDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createKycDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload.data);
        state.error = null;
      })
      .addCase(createKycDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update KYC Document
    builder
      .addCase(updateKycDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateKycDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.data.id);
        if (index !== -1) {
          state.documents[index] = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateKycDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get KYC Document by ID
    builder
      .addCase(getKycDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getKycDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update existing document or add new one
        const index = state.documents.findIndex(doc => doc.id === action.payload.data.id);
        if (index !== -1) {
          state.documents[index] = action.payload.data;
        } else {
          state.documents.push(action.payload.data);
        }
        state.error = null;
      })
      .addCase(getKycDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete KYC Document
    builder
      .addCase(deleteKycDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteKycDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteKycDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUploadProgress, resetUploadProgress } = kycSlice.actions;

// Selectors
export const selectKycDocuments = (state: { kyc: KycState }) => state.kyc.documents;
export const selectKycStatus = (state: { kyc: KycState }) => state.kyc.status;
export const selectKycLoading = (state: { kyc: KycState }) => state.kyc.isLoading;
export const selectKycError = (state: { kyc: KycState }) => state.kyc.error;
export const selectUploadProgress = (state: { kyc: KycState }) => state.kyc.uploadProgress;
export const selectKycPagination = (state: { kyc: KycState }) => state.kyc.pagination;

// Helper selectors - Updated to remove document status checks
export const selectCanEditKyc = (state: { kyc: KycState }) => {
  // Users can always edit KYC documents regardless of status
  return true;
};

export const selectKycIsApproved = (state: { kyc: KycState }) => {
  const status = state.kyc.status;
  return status && status.status === 'approved';
};

// Additional helper selectors
export const selectKycDocumentById = (state: { kyc: KycState }, documentId: string) => {
  return state.kyc.documents.find(doc => doc.id === documentId);
};

export const selectKycDocumentsByType = (state: { kyc: KycState }, documentType: string) => {
  return state.kyc.documents.filter(doc => doc.documentType === documentType);
};

export const selectKycDocumentsByStatus = (state: { kyc: KycState }, status: string) => {
  return state.kyc.documents.filter(doc => doc.status === status);
};

export default kycSlice.reducer;
