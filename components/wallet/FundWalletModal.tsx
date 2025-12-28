"use client";

import React, { useState, useEffect } from 'react';
import { X, Wallet, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  onSuccess: () => void;
}

// Declare PaystackPop type
interface PaystackHandler {
  openIframe: () => void;
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: Record<string, unknown>;
  callback?: (response: { reference: string; transaction?: string; status?: string }) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => PaystackHandler;
    };
  }
}

const FundWalletModal: React.FC<FundWalletModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
  onSuccess
}) => {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

  // Quick amount buttons
  const quickAmounts = [1000, 5000, 10000, 20000, 50000, 100000];

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Paystack script loaded');
      setPaystackLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Paystack script');
      setError('Failed to load payment system. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onPaystackSuccess = async (reference: { reference: string; transaction?: string; status?: string }) => {
    console.log('🎉 Paystack payment successful!', reference);
    
    // Don't close modal, show processing state
    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      console.log('💰 Crediting wallet with amount:', parseFloat(amount));
      console.log('📍 API URL:', `${apiUrl}/wallet/fund`);
      console.log('🔑 Has token:', !!token);

      const requestBody = {
        amount: parseFloat(amount),
        paystackReference: reference.reference,
        metadata: {
          transaction_id: reference.transaction,
          status: reference.status
        }
      };
      
      console.log('📤 Request body:', requestBody);

      const response = await fetch(`${apiUrl}/wallet/fund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Wallet credited successfully!');
        setSuccess(true);
        setIsProcessing(false);
        
        // Wait 2 seconds to show success, then close and refresh
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to credit wallet');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to credit wallet';
      console.error('Error crediting wallet:', error);
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const onPaystackClose = () => {
    console.log('⚠️ Paystack popup closed');
    if (!success && !isProcessing) {
      setError('Payment was cancelled. Please try again.');
    }
  };

  const handleFundWallet = () => {
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < 100) {
      setError('Minimum funding amount is ₦100');
      return;
    }

    if (amountNum > 1000000) {
      setError('Maximum funding amount is ₦1,000,000');
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    setError(null);

    const reference = `wallet-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    console.log('🚀 Initializing Paystack payment with reference:', reference);

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: userEmail,
      amount: amountNum * 100, // Convert to kobo
      currency: 'NGN',
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Wallet Funding",
            variable_name: "wallet_funding",
            value: "true"
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: userName
          }
        ]
      },
      callback: function(response: { reference: string; transaction?: string; status?: string }) {
        console.log('✅ Paystack callback triggered!', response);
        onPaystackSuccess(response);
      },
      onClose: function() {
        console.log('⚠️ Paystack popup closed by user');
        onPaystackClose();
      }
    });

    handler.openIframe();
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl transform transition-all animate-slideUp">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-purple-600 px-6 py-8 rounded-t-3xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Fund Wallet</h2>
                <p className="text-sm text-white/80 mt-0.5">Add money to your wallet</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isProcessing && !error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
              <p className="text-gray-600">Please wait while we credit your wallet</p>
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your wallet has been credited with ₦{parseFloat(amount).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
            </div>
          ) : (
            <>
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Enter Amount
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    ₦
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Min: ₦100 • Max: ₦1,000,000
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      disabled={isProcessing}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        amount === value.toString()
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      ₦{(value / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  </div>
                  {error.includes('cancelled') && (
                    <button
                      onClick={() => {
                        setError(null);
                        handleFundWallet();
                      }}
                      className="w-full px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-all duration-200"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Secure Payment via Paystack
                    </h4>
                    <p className="text-xs text-gray-600">
                      Your payment is processed securely. Funds will be credited to your wallet instantly after successful payment.
                    </p>
                 
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFundWallet}
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0 || !paystackLoaded}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {!paystackLoaded ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5" />
                      Fund Wallet
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundWalletModal;
