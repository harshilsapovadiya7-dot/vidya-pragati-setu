import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Search, FileText, FolderOpen, Gift,
  Bell, User, School, Users, ClipboardList, Bike, BarChart3, Settings,
  Shield, FileCheck, MapPin, CreditCard, BookOpen, LogOut, Menu, X,
  ChevronDown, Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import DemoBanner from './DemoBanner';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Student',
  PARENT: 'Parent / Guardian',
  TEACHER: 'Teacher',
  PRINCIPAL: 'School Principal',
  DISTRICT_OFFICER: 'District Education Officer',
  STATE_ADMIN: 'State Administrator',
};

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  STUDENT: [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Find Scholarships', path: '/student/schemes', icon: Search },
    { label: 'My Applications', path: '/student/applications', icon: FileText },
    { label: 'My Documents', path: '/student/documents', icon: FolderOpen },
    { label: 'Benefits Tracking', path: '/student/benefits', icon: Gift },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'My Profile', path: '/student/profile', icon: User },
  ],
  TEACHER: [
    { label: 'Dashboard', path: '/school/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/school/students', icon: Users },
    { label: 'Applications', path: '/school/applications', icon: ClipboardList },
    { label: 'Documents', path: '/school/documents', icon: FileCheck },
    { label: 'Asset Tracking', path: '/school/assets', icon: Bike },
  ],
  PRINCIPAL: [
    { label: 'Dashboard', path: '/school/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/school/students', icon: Users },
    { label: 'Applications', path: '/school/applications', icon: ClipboardList },
    { label: 'Documents', path: '/school/documents', icon: FileCheck },
    { label: 'Asset Tracking', path: '/school/assets', icon: Bike },
  ],
  DISTRICT_OFFICER: [
    { label: 'Dashboard', path: '/district/dashboard', icon: LayoutDashboard },
    { label: 'Applications', path: '/district/applications', icon: ClipboardList },
    { label: 'Schools', path: '/district/schools', icon: School },
    { label: 'Asset Tracking', path: '/district/assets', icon: Bike },
    { label: 'Reports', path: '/district/reports', icon: BarChart3 },
  ],
  STATE_ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Schemes', path: '/admin/schemes', icon: BookOpen },
    { label: 'Eligibility Rules', path: '/admin/rules', icon: Shield },
    { label: 'Districts', path: '/admin/districts', icon: MapPin },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Asset Tracking', path: '/admin/assets', icon: Bike },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] || [];
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DemoBanner />

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-navy-700 to-navy-900 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-navy-900 hidden sm:inline">Vidya Pragati Setu</span>
            </Link>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            {user.role === 'STUDENT' && (
              <button
                onClick={() => navigate('/student/notifications')}
                className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-navy-100 text-navy-700 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">{ROLE_LABELS[user.role]}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 sm:hidden">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
                </div>
                <DropdownMenuSeparator className="sm:hidden" />
                {user.role === 'STUDENT' && (
                  <DropdownMenuItem onClick={() => navigate('/student/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
            lg:relative lg:translate-x-0 lg:z-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ top: 'auto' }}
        >
          <div className="h-full pt-4 pb-4 overflow-y-auto">
            {/* Role Badge */}
            <div className="px-4 mb-4">
              <Badge variant="outline" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>

            {/* Navigation Items */}
            <nav className="px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-navy-50 text-navy-700 border border-navy-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-navy-600' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                    {item.label === 'Notifications' && unreadCount > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export { DashboardLayout };
