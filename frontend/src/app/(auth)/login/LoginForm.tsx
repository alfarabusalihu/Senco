'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login(data);
      setAuth(response.user, response.accessToken);
      toast.success('Signed in successfully');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to sign in');
      setError('root', {
        message: error.message || 'Failed to sign in. Please check your credentials.',
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-gray-200">
      <CardHeader className="space-y-1 text-center pb-6 pt-8">
        <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-gray-500 text-base">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-8">
          {errors.root && (
            <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-100">
              {errors.root.message}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="john.doe@senco.com" 
              className="h-11 text-base"
              {...register('email')} 
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'}
                className="h-11 text-base pr-10"
                {...register('password')} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6 px-8 pb-8">
          <Button type="submit" className="w-full btn-primary h-12 text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
          <div className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
export default LoginForm;
