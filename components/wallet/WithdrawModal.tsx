"use client";

import React, { useState, useEffect } from 'react';
import { X, Wallet, AlertCircle, CheckCircle, Loader2, Building2, User, CreditCard } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onSuccess: () => void;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  slug: string;
}

interface AccountVerification {
  account_number: string;
  account_name: string;
  bank_id: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onSuccess
}) => {
  const [amount, setAmount] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountName, setAccountName] = useState<string>('');
  
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);

  // Quick amount buttons (percentage of balance)
  const quickAmounts = [
    { label: '25%', value: walletBalance * 0.25 },
    { label: '50%', value: walletBalance * 0.5 },
    { label: '75%', value: walletBalance * 0.75 },
    { label: 'All', value: walletBalance }
  ];

  // Fetch Nigerian banks from Paystack
  useEffect(() => {
    if (isOpen) {
      fetchBanks();
    }
  }, [isOpen]);

  const fetchBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const response = await fetch('https://api.paystack.co/bank?country=nigeria', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`
        }
      });

      const data = await response.json();
      
      if (data.status) {
        setBanks(data.data);
        console.log('✅ Fetched', data.data.length, 'banks');
      } else {
        throw new Error('Failed to fetch banks');
      }
    } catch (error) {
      console.error('❌ Error fetching banks:', error);
      setError('Failed to load banks. Please try again.');
    } finally {
      setIsLoadingBanks(false);
    }
  };

  // Verify account number with Paystack
  const verifyAccount = async () => {
    if (!accountNumber || accountNumber.length !== 10) {
      setError('Please enter a valid 10-digit account number');
      return;
    }

    if (!selectedBank) {
      setError('Please select a bank');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setAccountVerified(false);
    setAccountName('');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/wallet/verify-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountNumber,
          bankCode: selectedBank
        })
      });

      const data = await response.json();
      console.log('📥 Account verification response:', data);

      if (data.success && data.data.account_name) {
        setAccountName(data.data.account_name);
        setAccountVerified(true);
        console.log('✅ Account verified:', data.data.account_name);
      } else {
        throw new Error(data.message || 'Could not verify account');
      }
    } catch (error) {
      console.error('❌ Error verifying account:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify account');
      setAccountVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < 100) {
      setError('Minimum withdrawal amount is ₦100');
      return;
    }

    if (amountNum > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    if (!accountVerified) {
      setError('Please verify your account first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      const bankName = banks.find(b => b.code === selectedBank)?.name || '';

      const response = await fetch(`${apiUrl}/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountNum,
          bankDetails: {
            accountNumber,
            accountName,
            bankCode: selectedBank,
            bankName
          }
        })
      });

      const data = await response.json();
      console.log('📥 Withdrawal response:', data);

      if (data.success) {
        console.log('✅ Withdrawal request submitted successfully!');
        setSuccess(true);
        
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('❌ Error processing withdrawal:', error);
      setError(error instanceof Error ? error.message : 'Failed to process withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount('');
      setAccountNumber('');
      setSelectedBank('');
      setAccountName('');
      setError(null);
      setSuccess(false);
      setAccountVerified(false);
      onClose();
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(Math.floor(value).toString());
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl transform transition-all animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-6 py-8 rounded-t-3xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
                <p className="text-sm text-white/80 mt-0.5">Transfer to your bank account</p>
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
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Withdrawal Requested!</h3>
              <p className="text-gray-600">Your withdrawal request has been submitted and will be processed within 24 hours.</p>
              <p className="text-sm text-gray-500 mt-2">Closing...</p>
            </div>
          ) : (
            <>
              {/* Available Balance */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Withdrawal Amount
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
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Min: ₦100 • Max: ₦{walletBalance.toLocaleString()}
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleQuickAmount(item.value)}
                      disabled={isProcessing || item.value <= 0}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        amount === Math.floor(item.value).toString()
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Bank
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedBank}
                    onChange={(e) => {
                      setSelectedBank(e.target.value);
                      setAccountVerified(false);
                      setAccountName('');
                      setError(null);
                    }}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                    disabled={isProcessing || isLoadingBanks}
                  >
                    <option value="">
                      {isLoadingBanks ? 'Loading banks...' : 'Choose your bank'}
                    </option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Account Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setAccountNumber(value);
                        setAccountVerified(false);
                        setAccountName('');
                        setError(null);
                      }}
                      placeholder="0123456789"
                      maxLength={10}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      disabled={isProcessing}
                    />
                  </div>
                  <button
                    onClick={verifyAccount}
                    disabled={isVerifying || !accountNumber || accountNumber.length !== 10 || !selectedBank || accountVerified}
                    className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying
                      </>
                    ) : accountVerified ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Verified
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </div>

              {/* Account Name Display */}
              {accountVerified && accountName && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <User className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">Account Verified</p>
                    <p className="text-sm text-green-700 mt-1">{accountName}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Info Message */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Withdrawal Processing Time
                    </h4>
                    <p className="text-xs text-gray-600">
                      Withdrawals are processed within 24 hours. Funds will be transferred to your verified bank account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0 || !accountVerified}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5" />
                      Withdraw
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

export default WithdrawModal;
