import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { GraduationCap, Eye, EyeOff, Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      setLocation('/teacher');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3fc] flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-[#183a68] selection:text-white">
      {/* Subtle top decoration badge */}
      

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        {/* Brand Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-[#f1f3fc]">
          <img
            src="/logo w-04.png"
            alt="Wispace Logo"
            className="h-14 w-auto object-contain mx-auto mb-3.5"
          />
          <h1 className="text-2xl font-bold text-[#183a68] tracking-tight">
            Wispace Teacher
          </h1>
          <p className="text-xs text-[#64748b] mt-1.5 font-medium leading-relaxed">
            Hệ thống quản lý và đánh giá bài viết IELTS
          </p>
        </div>

        {/* Form Container */}
        <div className="px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#0f172a]">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="teacher@wispace.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#183a68]/20 focus:border-[#183a68] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-[#0f172a]">
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-9 pr-10 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#183a68]/20 focus:border-[#183a68] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-[#183a68] transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#cbd5e1] text-[#183a68] focus:ring-[#183a68]/30 accent-[#183a68] cursor-pointer"
                />
                <span className="text-xs font-medium text-[#64748b]">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Vui lòng liên hệ quản trị viên Wispace để đặt lại mật khẩu.')}
                className="text-xs font-semibold text-[#183a68] hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-600 font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Primary Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold mt-2 gap-2"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {!isLoading && <LogIn className="h-4 w-4" />}
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Footer - Register link */}
          <div className="mt-6 pt-5 border-t border-[#e2e8f0] text-center text-xs text-[#64748b]">
            Chưa có tài khoản giáo viên?{' '}
            <button
              type="button"
              onClick={() => setLocation('/register')}
              className="font-bold text-[#183a68] hover:underline cursor-pointer ml-1"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>

      {/* Academic Copyright Note */}
      <p className="mt-6 text-[11px] text-[#94a3b8] text-center">
        Wispace Platform • Hệ sinh thái luyện thi IELTS chuẩn khảo thí
      </p>
    </div>
  );
}
