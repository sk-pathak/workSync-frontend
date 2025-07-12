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
    totalProjects: userProjects.content.length + memberProjects.content.length,
    completedProjects: [...userProjects.content, ...memberProjects.content].filter(
      p => p.status === 'COMPLETED'
    ).length,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gradient-dark min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary drop-shadow">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">
                    {user?.name || user?.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{user?.username}</p>
                  <Badge variant="secondary" className="mt-2">
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Joined {user?.createdAt ? formatDistanceToNow(new Date(user.createdAt)) : ''} ago
                  </span>
                </div>
              </div>

              {user?.bio && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
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
          className="lg:col-span-2 space-y-6"
        >
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="neu-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </CardContent>
            </Card>
            <Card className="neu-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.ownedProjects}</div>
                <p className="text-sm text-muted-foreground">Owned</p>
              </CardContent>
            </Card>
            <Card className="neu-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.memberProjects}</div>
                <p className="text-sm text-muted-foreground">Member</p>
              </CardContent>
            </Card>
            <Card className="neu-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.completedProjects}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile */}
          <Card className="neu-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Profile</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleCancel} size="sm" variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    {...register('name')}
                    disabled={!isEditing}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    disabled={!isEditing}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    {...register('bio')}
                    disabled={!isEditing}
                    rows={4}
                    className={errors.bio ? 'border-destructive' : ''}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                </div>

                {isEditing && (
                  <Button type="submit" disabled={isLoading}>
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