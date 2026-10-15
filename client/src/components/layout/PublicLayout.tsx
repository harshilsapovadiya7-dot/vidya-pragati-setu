import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap, BookOpen, HelpCircle, LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicLayout() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    const paths: Record<string, string> = {
      STUDENT: '/student/dashboard',
      TEACHER: '/school/dashboard',
      PRINCIPAL: '/school/dashboard',
      DISTRICT_OFFICER: '/district/dashboard',
      STATE_ADMIN: '/admin/dashboard',
    };
    return paths[user.role] || '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-navy-700 to-navy-900 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-navy-900 leading-tight">Vidya Pragati Setu</h1>
                <p className="text-xs text-gray-500 leading-tight">Student Scholarships & Material Assistance</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/schemes"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/schemes' ? 'text-navy-700' : 'text-gray-600 hover:text-navy-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Schemes
                </span>
              </Link>
              <Link
                to="/help"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/help' ? 'text-navy-700' : 'text-gray-600 hover:text-navy-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  Help
                </span>
              </Link>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to={getDashboardPath()}>
                  <Button size="sm">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="sm">
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-saffron-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Vidya Pragati Setu</h3>
                  <p className="text-sm text-gray-400">Student Scholarships & Material Assistance Portal</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                One trusted digital platform to discover scholarships, verify eligibility, track financial
                assistance, and monitor material benefits for students across Gujarat.
              </p>
              <p className="text-xs text-gray-500 mt-4 italic">
                "One Student. One Record. Every Eligible Opportunity."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/schemes" className="hover:text-white transition-colors">Available Schemes</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help & Support</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Accessibility</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Education Department</li>
                <li>Government of Gujarat</li>
                <li className="text-xs text-gray-500 mt-4">
                  This is a demonstration prototype. Contact information is a placeholder.
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2024 Vidya Pragati Setu — Prototype for demonstration purposes only.
              Not an official government service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { PublicLayout };
