import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      setAuth(response.user, response.token);
      toast.success('Account created!', {
        description: 'Welcome to WorkSync. Your account has been created successfully.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <Card className="glass-card border-0 shadow-2xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-white font-medium">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...register('username')}
                className={`glass-input ${errors.username ? 'border-red-400' : ''}`}
              />
              {errors.username && (
                <p className="text-sm text-red-300">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-white font-medium">
                Full Name
                <span className="optional-badge">Optional</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                {...register('name')}
                className="glass-input-optional"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className={`glass-input ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-300">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-white font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`glass-input ${errors.password ? 'border-red-400' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-300">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full glass-button h-12 text-lg font-medium" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-300">Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-purple-300 hover:text-purple-200 transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
