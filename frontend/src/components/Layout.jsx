import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Globe, 
  Users, 
  Server, 
  Mail, 
  UsersRound, 
  Wifi,
  LogOut,
  Key,
  History,
  FolderOpen
} from 'lucide-react';
import { Button } from './ui/button';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator'] },
    { path: '/domains', label: 'Domains', icon: Globe, roles: ['admin', 'operator'] },
    { path: '/domains-history', label: 'Assignment History', icon: History, roles: ['admin', 'operator'] },
    { path: '/providers', label: 'Providers', icon: Server, roles: ['admin', 'operator'] },
    { path: '/accounts', label: 'Accounts', icon: Key, roles: ['admin'] },
    { path: '/teams', label: 'Teams', icon: UsersRound, roles: ['admin'] },
    { path: '/mailers', label: 'Mailers', icon: Mail, roles: ['admin'] },
    { path: '/isps', label: 'ISPs', icon: Wifi, roles: ['admin'] },
    { path: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (isAdmin()) return item.roles.includes('admin');
    return item.roles.includes('operator');
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-200 px-6">
            <Globe className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold text-gray-900">Gestion Domains</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin() ? 'Administrator' : 'Operator'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
