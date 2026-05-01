import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle, Mail, CheckCircle, ArrowRight, Send, RefreshCw } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const MaintenanceKeywordPrompt = ({ onCorrectKeyword }) => {
  const ADMIN_EMAIL = 'ugwanezav@gmail.com'; // Default admin email (cannot be changed)
  
  const [step, setStep] = useState(1); // 1 = send code, 2 = verify code, 3 = keyword
  const [verificationCode, setVerificationCode] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showKeyword, setShowKeyword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeExpiry, setCodeExpiry] = useState(null);

  console.log('🔐 Two-Step Verification with Email Code Rendered!');

  // Send verification code to admin email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setSendingCode(true);
    setError('');
    
    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code in sessionStorage with 5-minute expiry
      const expiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes
      sessionStorage.setItem('maintenanceVerificationCode', code);
      sessionStorage.setItem('codeExpiry', expiryTime.toString());
      setCodeExpiry(expiryTime);
      
      console.log('📧 Sending verification code to email...');
      
      // Send email with verification code
      const response = await axiosClient.post('/contacts/send-maintenance-code', {
        email: ADMIN_EMAIL,
        code: code
      });
      
      console.log('✅ Verification code sent to email successfully!');
      
      setSuccess(`📧 Verification code sent to ${ADMIN_EMAIL}! Check your email inbox.`);
      setStep(2);
      setSendingCode(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setSendingCode(false);
      console.error('❌ Failed to send verification code:', error);
      console.error('❌ Error details:', error.response?.data);
      
      // Clear stored code on failure
      sessionStorage.removeItem('maintenanceVerificationCode');
      sessionStorage.removeItem('codeExpiry');
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to send verification code. Please check your internet connection and try again.';
      setError(errorMessage);
    }
  };

  // Verify the code entered by user
  const handleVerifyCode = (e) => {
    e.preventDefault();
    console.log('🔢 Verification code submitted');
    
    const storedCode = sessionStorage.getItem('maintenanceVerificationCode');
    const expiry = sessionStorage.getItem('codeExpiry');
    
    // Check if code expired
    if (expiry && Date.now() > parseInt(expiry)) {
      setError('Verification code expired. Please request a new code.');
      sessionStorage.removeItem('maintenanceVerificationCode');
      sessionStorage.removeItem('codeExpiry');
      setStep(1);
      return;
    }
    
    // Verify code
    if (verificationCode === storedCode) {
      setEmailVerified(true);
      setError('');
      setSuccess('Email verified successfully!');
      setStep(3);
      console.log('✅ Email verified - proceeding to keyword step');
      
      // Clear verification code from storage
      sessionStorage.removeItem('maintenanceVerificationCode');
      sessionStorage.removeItem('codeExpiry');
      
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setAttempts(prev => prev + 1);
      setError('Invalid verification code. Please try again.');
      setVerificationCode('');
      
      // Lock after 3 failed attempts
      if (attempts >= 2) {
        setError('Too many failed attempts. Please request a new code.');
        sessionStorage.removeItem('maintenanceVerificationCode');
        sessionStorage.removeItem('codeExpiry');
        setTimeout(() => {
          setAttempts(0);
          setError('');
          setStep(1);
        }, 30000); // 30 second lockout
      }
    }
  };

  const handleKeywordSubmit = (e) => {
    e.preventDefault();
    console.log('🔑 Keyword submitted:', keyword);
    
    // Check if keyword is correct
    if (keyword.toUpperCase() === 'UGWANEZAV2020') {
      // Store in sessionStorage (persists during session)
      sessionStorage.setItem('maintenanceBypass', 'UGWANEZAV2020');
      sessionStorage.setItem('bypassTime', Date.now().toString());
      sessionStorage.setItem('adminEmail', ADMIN_EMAIL);
      
      // Success
      setError('');
      onCorrectKeyword();
    } else {
      // Wrong keyword
      setAttempts(prev => prev + 1);
      setError('Incorrect security keyword. Access denied.');
      setKeyword('');
      
      // Lock after 3 failed attempts
      if (attempts >= 2) {
        setError('Too many failed attempts. Locked for security.');
        setTimeout(() => {
          setAttempts(0);
          setError('');
          // Reset to step 1 after lockout
          setStep(1);
          setVerificationCode('');
          setEmailVerified(false);
        }, 30000); // 30 second lockout
      }
    }
  };

  const isLocked = attempts >= 3;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-orange-200 dark:border-orange-800">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full mb-4">
            <Shield size={32} className="text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Two-Step Verification
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {step === 1 && 'Step 1: Request verification code'}
            {step === 2 && 'Step 2: Enter verification code'}
            {step === 3 && 'Step 3: Enter security keyword'}
          </p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {step > 1 ? <CheckCircle size={16} /> : '1'}
            </div>
            <div className={`h-0.5 w-8 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {emailVerified ? <CheckCircle size={16} /> : '2'}
            </div>
            <div className={`h-0.5 w-8 ${step >= 3 ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* STEP 1: Send Verification Code */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            {/* Default Admin Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={ADMIN_EMAIL}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white cursor-not-allowed"
                  />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📧 Verification code will be sent to this email
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  {success}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Send Code Button */}
            <button
              type="submit"
              disabled={sendingCode}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2"
            >
              {sendingCode ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Verification Code
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Verify Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                📧 Email sent to: <strong>{ADMIN_EMAIL}</strong>
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Check your inbox (and spam folder) for the 6-digit code
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1 font-semibold">
                ⏰ Expires in 5 minutes
              </p>
            </div>

            {/* Verification Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLocked}
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  {success}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Attempts Counter */}
            {attempts > 0 && !isLocked && (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || verificationCode.length !== 6}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2"
            >
              {isLocked ? 'Locked - Wait 30s' : (
                <>
                  Verify Code
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Resend Code */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium py-2 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Resend code
            </button>
          </form>
        )}

        {/* STEP 3: Keyword Entry */}
        {step === 3 && (
          <form onSubmit={handleKeywordSubmit} className="space-y-4">
            {/* Email Verified Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Email Verified</p>
                <p className="text-xs text-green-700 dark:text-green-400">{ADMIN_EMAIL}</p>
              </div>
            </div>

            {/* Keyword Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Security Keyword
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showKeyword ? 'text' : 'password'}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  disabled={isLocked}
                  placeholder="Enter keyword"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoComplete="off"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKeyword(!showKeyword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeyword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Attempts Counter */}
            {attempts > 0 && !isLocked && (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || !keyword}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2"
            >
              {isLocked ? 'Locked - Wait 30s' : (
                <>
                  <Lock size={20} />
                  Verify & Access
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setStep(2);
                setKeyword('');
                setError('');
              }}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium py-2 transition-colors"
            >
              ← Back to code verification
            </button>
          </form>
        )}

        {/* Security Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
              <Shield size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Two-Step Verification Active</p>
                <p className="text-blue-700 dark:text-blue-400">
                  Enhanced security requires both email verification and keyword authentication
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Lock size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              This dual-layer security protects the site during maintenance. Only authorized administrators with verified email and correct keyword can access the system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceKeywordPrompt;
