import React from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new senco account to start tracking weekly reports.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
