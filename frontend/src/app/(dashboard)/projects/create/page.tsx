'use client';

import React from 'react';
import { ProjectForm } from './ProjectForm';

export default function CreateProjectPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Project</h1>
        <p className="text-gray-500">Add a new project for your team</p>
      </div>
      <ProjectForm />
    </div>
  );
}
