import React from 'react';
import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your senco account to access your dashboard.',
};

export default function LoginPage() {
  return <LoginForm />;
}
