import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Bell,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

export function Header() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 h-20 flex items-center shadow-card rounded-b-2xl animate-fade-in border-b border-gray-700">
      <div className="flex items-center justify-between h-full px-8 w-full">
        {/* Actions */}
        <div className="flex items-center space-x-4 flex-1 max-w-md" />
        <div className="flex items-center space-x-4">
          {/* Create Project Button */}
          <Link to="/projects/new">
            <Button size="sm" className="gap-2 neu-btn-dark">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>

          {/* Notifications */}
          <Link to="/notifications">
            <Button variant="ghost" size="sm" className="relative rounded-full hover-neu bg-gray-800 hover:bg-gray-700">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-button"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
            </Button>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-neu bg-gray-800 hover:bg-gray-700">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background radix-dialog-content z-[9999]" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.name && (
                    <p className="font-medium">{user.name}</p>
                  )}
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-destructive/20">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
