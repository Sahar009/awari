"use client";
import React, { useState } from "react";
import { KycUploadForm } from "../../components/KycUploadForm";
import Container from "../../components/Container";
import MainLayout from "../mainLayout";
import { ArrowLeft, Shield, CheckCircle2, Upload, FileCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { KycService } from "../../services/kycService";
import { useAuth, useAppDispatch } from "../../store/hooks";
import { useEffect } from "react";
import { hydrate } from "../../store/slices/authSlice";

const KycPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);

  useEffect(() => {
    // Redirect to login if not authenticated (after a short delay to allow hydration)
    const timer = setTimeout(() => {
      if (!isAuthenticated && typeof window !== 'undefined') {
        router.push('/auth/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Check if we have any token available (Redux or localStorage)
  const hasToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  
  // Show loading if no token at all
  if (!hasToken) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Authentication...</h2>
            <p className="text-gray-600">Please wait while we verify your login status.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleKycSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setUploadProgress(0);
    
    // Simulate upload progress for better UX during long uploads
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        // Slower progress simulation for larger files
        return prev + Math.random() * 8;
      });
    }, 500);
    
    try {
      // The API service automatically handles authentication via interceptors
      const result = await KycService.uploadDocument(formData);
      console.log('KYC upload successful:', result);
      
      // Complete the progress
      setUploadProgress(100);
      
      // Handle successful upload
      if (result.success) {
        console.log('Document uploaded successfully:', result.data);
        
        // Clear preview after successful upload
        setTimeout(() => {
          setPreviewFile(null);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setPreviewUrl(null);
        }, 2000);
      }
            
    } catch (error: any) {
      console.error('KYC upload error:', error);
      clearInterval(progressInterval);
      setUploadProgress(0);
      
      // Handle specific error types
      let errorMessage = 'An error occurred while uploading your document.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Upload timeout. Please check your connection and try again with a smaller file.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Please reduce the file size and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid file format. Please check your document and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Create a new error with user-friendly message
      const userError = new Error(errorMessage);
      throw userError;
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsSubmitting(false);
        setUploadProgress(0);
      }, 1500);
    }
  };

  const handlePreviewChange = (file: File | null, url: string | null) => {
    // Clean up previous URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewFile(file);
    setPreviewUrl(url);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <MainLayout>
      {/* Processing Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Document</h3>
            <p className="text-gray-600 mb-4">
              {uploadProgress < 30 
                ? "Preparing your document for upload..."
                : uploadProgress < 70
                ? "Uploading your document securely..."
                : "Processing and validating your document..."
              }
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-amber-600 mb-2">
                Retry attempt {retryCount}/3 - Large files may take longer to upload
              </p>
            )}
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <Container>
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900">KYC Verification</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container>
        <div className="py-12">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center max-w-2xl mx-auto">
              <div className="flex items-center w-full">
               
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full font-semibold">
                    1
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Document Upload</span>
                </div>
                
                {/* Connector */}
                <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                  <div className="h-1 bg-gray-300 rounded w-0"></div>
                </div>
                
                
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-500 rounded-full font-semibold">
                    2
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-500">Review</span>
                </div>
                
                {/* Connector */}
                <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                  <div className="h-1 bg-gray-300 rounded w-0"></div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-500 rounded-full font-semibold">
                    3
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-500">Verification</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
              <p className="text-sm text-gray-600">
                Submit clear photos or scans of your identity documents
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
                <FileCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Review</h3>
              <p className="text-sm text-gray-600">
                Our team reviews your documents within 24-48 hours
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Verified</h3>
              <p className="text-sm text-gray-600">
                Access all features once your identity is confirmed
              </p>
            </div>
          </div>

          {/* Document Preview Section */}
          {previewFile && previewUrl && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Document Preview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{previewFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Ready to Upload
                    </span>
                  </div>
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        const newWindow = window.open();
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head><title>Document Preview - ${previewFile.name}</title></head>
                              <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                                <img src="${previewUrl}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" />
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
                  <p className="text-xs text-gray-500 text-center">
                    Click image to view in full size • Make sure your document is clearly visible
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* KYC Form */}
          <KycUploadForm 
            onSubmit={handleKycSubmit} 
            isLoading={isSubmitting}
            onPreviewChange={handlePreviewChange}
          />
        </div>
      </Container>
      </div>
    </MainLayout>
  );
};

export default KycPage;