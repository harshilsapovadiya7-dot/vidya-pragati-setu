import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_ACCOUNTS, ROLE_LABELS, Role } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GraduationCap, Lock, Mail, AlertCircle, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('student@vidyapragati.gov.in');
  const [password, setPassword] = useState('password123');
  const [selectedDemoRole, setSelectedDemoRole] = useState<string>('STUDENT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const redirectAfterLogin = (role: Role) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    switch (role) {
      case 'STUDENT':
        navigate('/student/dashboard', { replace: true });
        break;
      case 'TEACHER':
      case 'PRINCIPAL':
        navigate('/school/dashboard', { replace: true });
        break;
      case 'DISTRICT_OFFICER':
        navigate('/district/dashboard', { replace: true });
        break;
      case 'STATE_ADMIN':
        navigate('/admin/dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const handleDemoAccountSelect = (roleKey: string) => {
    setSelectedDemoRole(roleKey);
    const demo = DEMO_ACCOUNTS.find((a) => a.role === roleKey);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide your registered ID / email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      redirectAfterLogin(user.role);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Authentication failed. Please verify credentials or select a demo persona.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* State Emblem / Portal Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-navy-900 flex items-center justify-center text-white shadow-lg ring-4 ring-navy-100">
            <GraduationCap className="h-9 w-9 text-saffron-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Single Sign-On Gateway
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            School Education & Scholarship Delivery Management System
          </p>
        </div>

        {/* Demo Account Switcher Card */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>Select Demo Evaluation Persona:</span>
          </div>
          <Select value={selectedDemoRole} onValueChange={handleDemoAccountSelect}>
            <SelectTrigger className="h-9 bg-white border-amber-300 text-xs font-medium">
              <SelectValue placeholder="Choose a demo role" />
            </SelectTrigger>
            <SelectContent>
              {DEMO_ACCOUNTS.map((acc) => (
                <SelectItem key={acc.role} value={acc.role} className="text-xs py-2">
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-navy-900">{acc.name}</span>
                    <span className="text-[10px] text-slate-500">{acc.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Login Form Card */}
        <Card className="border-slate-200 shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg font-bold text-navy-950">Citizen & Staff Login</CardTitle>
              <CardDescription className="text-xs">
                Enter your Samagra ID, Aadhaar number, or registered email.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email / User Identifier
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@vidyapragati.gov.in"
                    className="pl-9 h-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => alert('For demonstration purposes, password is password123')}
                    className="text-[11px] font-semibold text-saffron-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 h-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="rounded-md bg-slate-50 p-2.5 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Protected by 256-bit State Data Center Encryption</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold h-10 shadow-sm"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </Button>

              <div className="text-center text-xs text-slate-500">
                Are you a new student?{' '}
                <Link to="/schemes" className="font-semibold text-navy-900 hover:underline">
                  Browse schemes first
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
