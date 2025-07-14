import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotificationStore();
  const { logout, user } = useAuthStore();

  const filteredNavigation = navigation.filter(
    (item) => item.name !== 'Analytics' || (user && user.role === 'ADMIN')
  );

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out', {
        description: 'You have been successfully logged out.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <div 
      className={`flex flex-col h-[calc(100vh-2rem-3.5rem)] my-4 glass-card border border-white/10 shadow-glass transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-70'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glass">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wide text-text-primary">WorkSync</span>
              <span className="text-xs text-text-secondary">Project Management</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl glass-button hover:scale-105 transition-transform"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href}>
              <div
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 relative group hover:scale-102 active:scale-98',
                  isActive
                    ? 'bg-gradient-primary text-white shadow-glass'
                    : 'hover:bg-accent/10 hover:text-accent text-text-secondary'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                  />
                )}
                
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : "text-text-secondary group-hover:text-accent"
                )} />
                
                {!collapsed && (
                  <span
                    className={cn(
                      "font-medium",
                      isActive ? "text-white" : "text-text-secondary group-hover:text-accent"
                    )}
                  >
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        {/* Notifications */}
        <Link to="/notifications">
          <div
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 relative group hover:scale-102 active:scale-98',
              location.pathname === '/notifications'
                ? 'bg-gradient-primary text-white shadow-glass'
                : 'hover:bg-accent/10 hover:text-accent text-text-secondary'
            )}
          >
            {/* Active indicator */}
            {location.pathname === '/notifications' && (
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
              />
            )}
            
            <Bell className={cn(
              "w-5 h-5 flex-shrink-0",
              location.pathname === '/notifications' ? "text-white" : "text-text-secondary group-hover:text-accent"
            )} />
            
            {!collapsed && (
              <span
                className={cn(
                  "font-medium",
                  location.pathname === '/notifications' ? "text-white" : "text-text-secondary group-hover:text-accent"
                )}
              >
                Notifications
              </span>
            )}
            
            {unreadCount > 0 && (
              <div
                className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-glass"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </Link>

        {/* Settings */}
        <Link to="/settings">
          <div
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 relative group hover:scale-102 active:scale-98',
              location.pathname === '/settings'
                ? 'bg-gradient-primary text-white shadow-glass'
                : 'hover:bg-accent/10 hover:text-accent text-text-secondary'
            )}
          >
            {/* Active indicator */}
            {location.pathname === '/settings' && (
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
              />
            )}
            
            <Settings className={cn(
              "w-5 h-5 flex-shrink-0",
              location.pathname === '/settings' ? "text-white" : "text-text-secondary group-hover:text-accent"
            )} />
            
            {!collapsed && (
              <span
                className={cn(
                  "font-medium",
                  location.pathname === '/settings' ? "text-white" : "text-text-secondary group-hover:text-accent"
                )}
              >
                Settings
              </span>
            )}
          </div>
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 hover:bg-red-500/10 hover:text-red-400 text-text-secondary group hover:scale-102 active:scale-98"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-text-secondary group-hover:text-red-400" />
          {!collapsed && (
            <span className="font-medium text-text-secondary group-hover:text-red-400">
              Logout
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}