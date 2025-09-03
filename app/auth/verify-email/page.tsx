'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { Logo } from '@/components/navbar/Logo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyEmail, resendVerificationEmail, clearError } from '@/store/slices/authSlice';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from URL params or localStorage
  useEffect(() => {
    const emailParam = searchParams?.get('email');
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pendingVerificationEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect to register
      router.push('/auth/register');
    }
  }, [searchParams, router]);

  // Redirect if already authenticated and verified
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newCode = [...verificationCode];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setVerificationCode(newCode);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    const code = verificationCode.join('');
    if (code.length !== 4) {
      return;
    }
    
    try {
      console.log('Verifying email with code:', code);
      const result = await dispatch(verifyEmail({ email, verificationCode: code })).unwrap();
      console.log('Email verification successful:', result);
      
      // Clear pending verification email
      localStorage.removeItem('pendingVerificationEmail');
      
      // Redirect to home page
      router.push('/home');
    } catch (error) {
      console.error('Email verification failed:', error);
      // Clear the verification code on error
      setVerificationCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || !email) return;
    
    setIsResending(true);
    setResendMessage('');
    dispatch(clearError());
    
    try {
      const result = await dispatch(resendVerificationEmail({ email })).unwrap();
      console.log('Resend verification successful:', result);
      setResendMessage('Verification code sent successfully!');
      setCountdown(60); 
    } catch (error) {
      console.error('Resend verification failed:', error);
    } finally {
      setIsResending(false);
    }
  };

  const isCodeComplete = verificationCode.every(digit => digit !== '');

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image with Verification Info */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/assets/images/auth-bg.jpg" 
            alt="Luxury property background" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-purple-900/40 to-slate-800/60"></div>
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-center h-full p-12">
          <div className="max-w-md animate-fadeInDown">
            <div className="transform hover:scale-105 transition-transform duration-300 mb-8">
              <Logo />
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Check Your Email
                </h2>
                                 <p className="text-purple-200 leading-relaxed">
                   We&apos;ve sent a 4-digit verification code to your email address. 
                   Please enter the code below to verify your account and activate your profile.
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping delay-3000"></div>
        </div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-white via-purple-50 to-purple-100 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Main Container */}
        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fadeInDown">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Verify Your Email
            </h1>
            <p className="text-slate-600">
              Enter the 4-digit code sent to
            </p>
            <p className="text-primary font-medium">
              {email}
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-purple-200/30 shadow-2xl animate-fadeInUp">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Verification Code Input */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 text-center block">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-3">
                  {verificationCode.map((digit, index) => (
                                         <input
                       key={index}
                       ref={(el) => { inputRefs.current[index] = el; }}
                       type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-bold bg-white/60 border border-purple-200/50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder="0"
                    />
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-600 text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {resendMessage && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 text-green-600 text-sm">
                  {resendMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isCodeComplete}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Verify Email</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </button>
            </form>

            {/* Resend Code */}
            <div className="mt-6 text-center">
                             <p className="text-slate-600 mb-3">
                 Didn&apos;t receive the code?
               </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Back to Register */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Wrong email?{' '}
                <Link
                  href="/auth/register"
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  Go back to register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
