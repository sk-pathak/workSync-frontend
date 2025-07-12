import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  User,
  FolderOpen,
  Users,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const profileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userProjects = { content: [] } } = useQuery({
    queryKey: ['user', 'owned-projects'],
    queryFn: () => userApi.getOwnedProjects(),
  });

  const { data: memberProjects = { content: [] } } = useQuery({
    queryKey: ['user', 'joined-projects'],
    queryFn: () => userApi.getJoinedProjects(),
  });

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getCurrentUser(),
    initialData: user,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      email: user?.email || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return userApi.updateCurrentUser(data);
    },
    onSuccess: (data: any) => {
      updateUser(data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update profile',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    setIsLoading(true);
    updateProfileMutation.mutate(data);
    setIsLoading(false);
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      bio: user?.bio || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  useEffect(() => {
    reset({
      name: userData?.name || '',
      bio: userData?.bio || '',
      email: userData?.email || '',
    });
  }, [userData, reset]);

  const stats = {
    ownedProjects: userProjects.content.length,
    memberProjects: memberProjects.content.length,
    myProjects: userProjects.content.length + memberProjects.content.length,
    completedProjects: [...userProjects.content, ...memberProjects.content].filter(
      p => p.status === 'COMPLETED'
    ).length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-gradient-dark min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <div className="p-3 rounded-xl bg-gradient-primary">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-text-primary">Profile</h1>
          <p className="text-text-secondary text-lg">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-xl text-text-primary">
                <div className="p-2 rounded-lg bg-accent/20 mr-3">
                  <User className="w-5 h-5 text-accent" />
                </div>
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-28 h-28 border-4 border-accent/20">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="text-3xl bg-gradient-primary text-white">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 glass-button hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-xl text-text-primary">
                    {user?.name || user?.username}
                  </h3>
                  <p className="text-text-secondary text-sm">@{user?.username}</p>
                  <Badge className="mt-3 bg-accent/20 text-accent border-accent/30">
                    {user?.role || 'User'}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-surface/30 border border-white/10">
                  <Mail className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-text-secondary">Email</p>
                    <p className="text-sm text-text-primary">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-surface/30 border border-white/10">
                  <Calendar className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-text-secondary">Member since</p>
                    <p className="text-sm text-text-primary">
                      {user?.createdAt ? formatDistanceToNow(new Date(user.createdAt)) : 'Unknown'} ago
                    </p>
                  </div>
                </div>
              </div>

              {user?.bio && (
                <>
                  <Separator className="bg-white/10" />
                  <div>
                    <h4 className="font-medium mb-2 text-text-primary">Bio</h4>
                    <p className="text-sm text-text-secondary bg-surface/30 p-3 rounded-lg border border-white/10">
                      {user.bio}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <FolderOpen className="w-6 h-6 text-accent mr-2" />
                  <div className="text-3xl font-bold text-text-primary">{stats.myProjects}</div>
                </div>
                <p className="text-sm text-text-secondary">My Projects</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <User className="w-6 h-6 text-green-400 mr-2" />
                  <div className="text-3xl font-bold text-text-primary">{stats.ownedProjects}</div>
                </div>
                <p className="text-sm text-text-secondary">Owned</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-400 mr-2" />
                  <div className="text-3xl font-bold text-text-primary">{stats.memberProjects}</div>
                </div>
                <p className="text-sm text-text-secondary">Member</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  <div className="text-3xl font-bold text-text-primary">{stats.completedProjects}</div>
                </div>
                <p className="text-sm text-text-secondary">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile */}
          <Card className="glass-card">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl text-text-primary">
                  <div className="p-2 rounded-lg bg-accent/20 mr-3">
                    <Edit className="w-5 h-5 text-accent" />
                  </div>
                  Edit Profile
                </CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="glass-button">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleCancel} className="glass-button bg-transparent border-border">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-text-primary font-medium">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    {...register('name')}
                    disabled={!isEditing}
                    className={`w-full neu-input ${errors.name ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-error mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-text-primary font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    disabled={!isEditing}
                    className={`w-full neu-input ${errors.email ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-error mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-text-primary font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    {...register('bio')}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full neu-input ${errors.bio ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                  />
                  {errors.bio && (
                    <p className="text-sm text-error mt-1">{errors.bio.message}</p>
                  )}
                </div>

                {isEditing && (
                  <Button type="submit" disabled={isLoading} className="glass-button w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}