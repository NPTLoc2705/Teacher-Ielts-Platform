import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { GraduationCap, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client validations
    if (!username.trim() || !email.trim() || !password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
        displayName: displayName.trim() || undefined,
      });
      setLocation('/teacher');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3fc] flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-[#183a68] selection:text-white">
      {/* Subtle top decoration badge */}
      

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-[#f1f3fc]">
            <img
              src="/logo w-04.png"
              alt="Wispace Logo"
              className="h-14 w-auto object-contain mx-auto mb-3.5"
            />
            <h1 className="text-2xl font-bold text-[#183a68] tracking-tight">Wispace Teacher</h1>
            <p className="text-xs text-[#64748b] mt-1.5 font-medium">Tạo tài khoản Giảng viên / Giáo viên chấm thi</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="displayName"
                type="text"
                label="Họ và tên"
                placeholder="Thầy / Cô Nguyễn Văn A"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <Input
                id="username"
                type="text"
                label="Tên đăng nhập *"
                placeholder="teacher_nguyenvana"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                id="email"
                type="email"
                label="Email giáo viên *"
                placeholder="teacher@wispace.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Mật khẩu *"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-2.5 text-[#64748b] hover:text-[#183a68] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Xác nhận mật khẩu *"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 bottom-2.5 text-[#64748b] hover:text-[#183a68] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-2" isLoading={isLoading} disabled={isLoading}>
                <UserPlus className="w-4 h-4 mr-1.5 inline-block" />
                {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </Button>
            </form>

            {/* Link to Login */}
            <div className="mt-6 pt-5 border-t border-[#e2e8f0] text-center text-xs text-[#64748b]">
              Đã có tài khoản giáo viên?{' '}
              <button
                type="button"
                onClick={() => setLocation('/login')}
                className="font-semibold text-[#183a68] hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
