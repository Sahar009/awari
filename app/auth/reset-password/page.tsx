'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/navbar/Logo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetPassword, clearError } from '@/store/slices/authSlice';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [resetToken, setResetToken] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from URL params or localStorage
  useEffect(() => {
    const emailParam = searchParams?.get('email');
    const storedEmail = localStorage.getItem('pendingResetEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pendingResetEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect to forgot password
      router.push('/auth/forgotpassword');
    }
  }, [searchParams, router]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleTokenInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newToken = [...resetToken];
    newToken[index] = value;
    setResetToken(newToken);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleTokenKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !resetToken[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleTokenPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newToken = [...resetToken];
    
    for (let i = 0; i < pastedData.length; i++) {
      newToken[i] = pastedData[i];
    }
    
    setResetToken(newToken);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    const token = resetToken.join('');
    if (token.length !== 6) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 8) {
      return;
    }
    
    try {
      console.log('Resetting password with token:', token);
      const result = await dispatch(resetPassword({ 
        email, 
        resetToken: token, 
        newPassword 
      })).unwrap();
      console.log('Password reset successful:', result);
      
      // Clear pending reset email
      localStorage.removeItem('pendingResetEmail');
      
      // Show success message
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset failed:', error);
      // Clear the reset token on error
      setResetToken(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const isTokenComplete = resetToken.every(digit => digit !== '');
  const isFormValid = isTokenComplete && newPassword.length >= 8 && newPassword === confirmPassword;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Success Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="/assets/images/auth-bg.jpg" 
              alt="Luxury property background" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-green-900/40 to-slate-800/60"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        </div>

        {/* Right Side - Success Message */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-white via-green-50 to-green-100 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-green-200/30 shadow-2xl text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-4">
                Password Reset Successful!
              </h1>
              <p className="text-slate-600 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <div className="text-sm text-slate-500">
                Redirecting to login page in 3 seconds...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image with Reset Info */}
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
                  <Lock className="w-8 h-8 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Reset Your Password
                </h2>
                                 <p className="text-purple-200 leading-relaxed">
                   We&apos;ve sent a 6-digit reset code to your email address. 
                   Please enter the code below along with your new password to complete the reset.
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

      {/* Right Side - Reset Form */}
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
              Reset Password
            </h1>
            <p className="text-slate-600">
              Enter the 6-digit code sent to
            </p>
            <p className="text-primary font-medium">
              {email}
            </p>
          </div>

          {/* Reset Form */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-purple-200/30 shadow-2xl animate-fadeInUp">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reset Token Input */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 text-center block">
                  Reset Code
                </label>
                <div className="flex justify-center space-x-2">
                  {resetToken.map((digit, index) => (
                                         <input
                       key={index}
                       ref={(el) => { inputRefs.current[index] = el; }}
                       type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleTokenInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleTokenKeyDown(index, e)}
                      onPaste={handleTokenPaste}
                      className="w-10 h-10 text-center text-lg font-bold bg-white/60 border border-purple-200/50 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder="0"
                    />
                  ))}
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                  New Password *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 bg-white/60 border border-purple-200/50 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                    placeholder="Enter new password (min 8 chars)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm New Password *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 bg-white/60 border border-purple-200/50 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Mismatch Error */}
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-600 text-sm">
                  Passwords do not match
                </div>
              )}

              {/* Password Length Error */}
              {newPassword && newPassword.length < 8 && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-600 text-sm">
                  Password must be at least 8 characters long
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-600 text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Reset Password</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
