import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { GraduationCap, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { HARDCODED_TEACHER_CREDENTIALS } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState(HARDCODED_TEACHER_CREDENTIALS.email);
  const [password, setPassword] = useState(HARDCODED_TEACHER_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err instanceof Error ? err.message : 'Dang nhap that bai');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(HARDCODED_TEACHER_CREDENTIALS.email);
    setPassword(HARDCODED_TEACHER_CREDENTIALS.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f1f3fc] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          {/* Header - Wispace Deep Navy */}
          <div className="bg-[#183a68] px-8 py-9 text-center border-b border-[#0f2a4a]">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-lg mb-3">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Wispace Teacher</h1>
            <p className="text-[#eaf2fd] text-xs mt-1 font-medium">Nen tang quan ly va danh gia bai viet IELTS</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="teacher@wispace.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Mat khau"
                  placeholder="••••••••"
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

              {/* Demo Account Box - Flat Border Style */}
              <div className="rounded-lg border border-[#c6dcfa] bg-[#eaf2fd]/70 p-3 text-xs text-[#183a68] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#183a68] flex items-center gap-1.5 mb-1">
                    <KeyRound className="h-3.5 w-3.5 text-[#183a68]" />
                    <span>Tai khoan mau (The Exam Study):</span>
                  </div>
                  <div className="text-[#475569] font-mono text-[11px] space-y-0.5">
                    <div>Email: <span className="font-semibold text-[#0f172a]">{HARDCODED_TEACHER_CREDENTIALS.email}</span></div>
                    <div>Mat khau: <span className="font-semibold text-[#0f172a]">{HARDCODED_TEACHER_CREDENTIALS.password}</span></div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1.5 text-xs font-semibold text-[#183a68] hover:text-[#0f2a4a] bg-white hover:bg-[#eaf2fd] border border-[#c6dcfa] rounded-md transition-colors cursor-pointer"
                >
                  Dien nhanh
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
                {isLoading ? 'Dang dang nhap...' : 'Dang nhap'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
