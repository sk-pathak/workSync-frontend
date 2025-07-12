import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings,
  Bell,
  Shield,
  Key,
  Trash2,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SettingsPage = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    projectUpdates: true,
    taskAssignments: true,
    joinRequests: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showProjects: true,
  });

  const { toast } = useToast();
  const { logout } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = () => {
    toast({
      title: 'Password updated',
      description: 'Your password has been successfully changed.',
    });
    reset();
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Account deleted',
      description: 'Your account has been permanently deleted.',
    });
    logout();
  };

  const saveNotificationSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  const savePrivacySettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your privacy settings have been updated.',
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-background min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <div className="p-3 rounded-xl bg-gradient-primary">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary text-lg">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="notifications" className="space-y-8">
          <TabsList className="flex justify-center bg-transparent p-0">
            <TabsTrigger
              value="notifications"
              className="group flex flex-row items-center cursor-pointer relative -mb-px px-8 py-1 min-w-[120px] text-text-secondary font-medium border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:!text-accent data-[state=active]:font-semibold hover:text-accent transition duration-150 ease-in-out bg-transparent !bg-transparent bg-none !bg-none rounded-none !rounded-none shadow-none !shadow-none ring-0 !ring-0 outline-none focus-visible:outline-none mr-8"
            >
              <Bell className="w-4 h-4 mr-2" />
              <span className="group-data-[state=active]:text-accent">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="group flex flex-row items-center cursor-pointer relative -mb-px px-8 py-1 min-w-[120px] text-text-secondary font-medium border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:!text-accent data-[state=active]:font-semibold hover:text-accent transition duration-150 ease-in-out bg-transparent !bg-transparent bg-none !bg-none rounded-none !rounded-none shadow-none !shadow-none ring-0 !ring-0 outline-none focus-visible:outline-none mr-8"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="group-data-[state=active]:text-accent">Privacy</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="group flex flex-row items-center cursor-pointer relative -mb-px px-8 py-1 min-w-[120px] text-text-secondary font-medium border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:!text-accent data-[state=active]:font-semibold hover:text-accent transition duration-150 ease-in-out bg-transparent !bg-transparent bg-none !bg-none rounded-none !rounded-none shadow-none !shadow-none ring-0 !ring-0 outline-none focus-visible:outline-none mr-8"
            >
              <Key className="w-4 h-4 mr-2" />
              <span className="group-data-[state=active]:text-accent">Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="group flex flex-row items-center cursor-pointer relative -mb-px px-8 py-1 min-w-[120px] text-text-secondary font-medium border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:!text-accent data-[state=active]:font-semibold hover:text-accent transition duration-150 ease-in-out bg-transparent !bg-transparent bg-none !bg-none rounded-none !rounded-none shadow-none !shadow-none ring-0 !ring-0 outline-none focus-visible:outline-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="group-data-[state=active]:text-accent">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl text-text-primary">
                  <div className="p-2 rounded-lg bg-accent/20 mr-3">
                    <Bell className="w-5 h-5 text-accent" />
                  </div>
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-text-primary font-medium">Email Notifications</Label>
                      <p className="text-text-secondary text-sm">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-text-primary font-medium">Push Notifications</Label>
                      <p className="text-text-secondary text-sm">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, push: checked }))
                      }
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-text-primary font-medium">Project Updates</Label>
                      <p className="text-text-secondary text-sm">
                        Get notified when projects you're involved in are updated
                      </p>
                    </div>
                    <Switch
                      checked={notifications.projectUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, projectUpdates: checked }))
                      }
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-text-primary font-medium">Task Assignments</Label>
                      <p className="text-text-secondary text-sm">
                        Get notified when tasks are assigned to you
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskAssignments}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, taskAssignments: checked }))
                      }
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-text-primary font-medium">Join Requests</Label>
                      <p className="text-text-secondary text-sm">
                        Get notified when someone requests to join your projects
                      </p>
                    </div>
                    <Switch
                      checked={notifications.joinRequests}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, joinRequests: checked }))
                      }
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover"
                    />
                  </div>
                </div>

                <Button onClick={saveNotificationSettings} className="glass-button hover:bg-accent/30">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl text-text-primary">
                  <div className="p-2 rounded-lg bg-accent/20 mr-3">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-text-primary font-medium">Profile Visibility</Label>
                      <p className="text-text-secondary text-sm">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <Switch
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, profileVisible: checked }))
                      }
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-text-primary font-medium">Show Email</Label>
                      <p className="text-text-secondary text-sm">
                        Display your email address on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, showEmail: checked }))
                      }
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-text-primary font-medium">Show Projects</Label>
                      <p className="text-text-secondary text-sm">
                        Display your projects on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showProjects}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, showProjects: checked }))
                      }
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover"
                    />
                  </div>
                </div>

                <Button onClick={savePrivacySettings} className="glass-button hover:bg-accent/30">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl text-text-primary">
                  <div className="p-2 rounded-lg bg-accent/20 mr-3">
                    <Key className="w-5 h-5 text-accent" />
                  </div>
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="currentPassword" className="text-text-primary font-medium">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...register('currentPassword')}
                      className={`w-full bg-surface/50 border border-border text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg px-4 py-3 transition-all duration-200 ${errors.currentPassword ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      placeholder="Enter your current password"
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-error mt-1">
                        {errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="newPassword" className="text-text-primary font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...register('newPassword')}
                      className={`w-full bg-surface/50 border border-border text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg px-4 py-3 transition-all duration-200 ${errors.newPassword ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      placeholder="Enter your new password"
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-error mt-1">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-text-primary font-medium">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      className={`w-full bg-surface/50 border border-border text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg px-4 py-3 transition-all duration-200 ${errors.confirmPassword ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      placeholder="Confirm your new password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-error mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="glass-button hover:bg-accent/30 w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="glass-card border-error/30">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-error">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-error/30 rounded-xl p-6 bg-error/5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium text-text-primary">Delete Account</h4>
                      <p className="text-text-secondary text-sm max-w-md">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="bg-error hover:bg-error/90 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              Are you sure you want to delete your account? This action cannot be undone.
              All your projects, tasks, and data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-error text-white hover:bg-error/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}