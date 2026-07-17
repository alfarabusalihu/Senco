'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { usersService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Key, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRoleDisplayName } from '@/lib/permissions';

export function SettingsForm() {
  const { user, setUser } = useAuthStore();
  
  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isSaving, setIsSaving] = useState(false);

  // Password form state
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Detect ANY changes (profile OR password)
  const hasProfileChanges = 
    firstName !== (user?.firstName || '') ||
    lastName !== (user?.lastName || '');
  
  const hasPasswordChanges = 
    currentPassword !== '' ||
    newPassword !== '' ||
    confirmPassword !== '';

  const hasAnyChanges = hasProfileChanges || hasPasswordChanges;

  const handleSaveAll = async () => {
    if (!hasAnyChanges) {
      toast('No changes to save', { icon: 'ℹ️' });
      return;
    }

    setIsSaving(true);
    let successCount = 0;

    try {
      // 1. Save profile changes if any
      if (hasProfileChanges) {
        const updatedUser = await usersService.updateMe({ firstName, lastName });
        setUser(updatedUser);
        successCount++;
      }

      // 2. Save password changes if any
      if (hasPasswordChanges) {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
          toast.error('Please fill in all password fields');
          setIsSaving(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error('New passwords do not match');
          setIsSaving(false);
          return;
        }

        if (newPassword.length < 8) {
          toast.error('New password must be at least 8 characters');
          setIsSaving(false);
          return;
        }

        await usersService.updatePassword({
          currentPassword,
          newPassword,
        });
        
        // Clear password fields on success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordOpen(false);
        successCount++;
      }

      // Success messages
      if (successCount === 2) {
        toast.success('Profile and password updated successfully');
      } else if (hasProfileChanges) {
        toast.success('Profile updated successfully');
      } else if (hasPasswordChanges) {
        toast.success('Password updated successfully');
      }
      
    } catch (error: unknown) {
      console.error('Failed to save changes', error);
      const message = error instanceof Error && 'response' in error 
        ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save changes')
        : 'Failed to save changes';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Profile Avatar Card */}
      <div className="md:col-span-1 space-y-4">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-blue-700">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
            <p className="text-sm text-gray-500 mt-1">{getRoleDisplayName(user?.role)}</p>
            <p className="text-xs text-gray-400 mt-2">{user?.email}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information Card */}
      <div className="md:col-span-2 space-y-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="p-6 pb-4">
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="h-10 bg-gray-50 cursor-not-allowed" 
              />
              <p className="text-xs text-gray-500">Email address cannot be changed</p>
            </div>

            {/* Collapsible Password Section */}
            <div className="pt-2 border-t border-gray-100">
              <Collapsible open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                <div className="flex items-center justify-between gap-3">
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      type="button"
                      className="h-10 rounded-md"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                      <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isPasswordOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  
                  {/* Save Changes button - always visible on same row when collapsible is closed */}
                  {!isPasswordOpen && (
                    <Button 
                      className="btn-primary h-10 rounded-md"
                      onClick={handleSaveAll} 
                      disabled={!hasAnyChanges || isSaving}
                      type="button"
                    >
                      {isSaving ? 'Saving...' : hasAnyChanges ? 'Save Changes' : 'No Changes'}
                    </Button>
                  )}
                </div>
                
                {!isPasswordOpen && hasProfileChanges && (
                  <p className="text-xs text-orange-600 mt-2">You have unsaved changes</p>
                )}
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-10"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-10"
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10"
                      placeholder="Re-enter new password"
                    />
                  </div>
                  
                  {/* Save Changes button - visible at bottom when collapsible is open */}
                  <div className="flex justify-end pt-2">
                    <Button 
                      className="btn-primary h-10 rounded-md"
                      onClick={handleSaveAll} 
                      disabled={!hasAnyChanges || isSaving}
                      type="button"
                    >
                      {isSaving ? 'Saving...' : hasAnyChanges ? 'Save Changes' : 'No Changes'}
                    </Button>
                  </div>
                  {(hasProfileChanges || hasPasswordChanges) && (
                    <p className="text-xs text-orange-600">You have unsaved changes</p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default SettingsForm;
