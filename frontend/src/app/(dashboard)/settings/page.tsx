'use client';

import React from 'react';
import { SettingsForm } from './SettingsForm';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>
      <SettingsForm />
    </div>
  );
}
