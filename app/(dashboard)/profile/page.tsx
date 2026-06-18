'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChangePasswordMutation, useUpdateUserMutation, useUserAddressesQuery, useUserQuery } from '@/hooks';
import { Lock, MapPin, User } from 'lucide-react';
import React, { useState } from 'react';

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useUserQuery();
  const { data: addresses, isLoading: addressesLoading } = useUserAddressesQuery();
  const updateUserMutation = useUpdateUserMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Initialize form when user data loads
  React.useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserMutation.mutateAsync(profileForm);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account information and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>

                {updateUserMutation.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {updateUserMutation.error instanceof Error
                        ? updateUserMutation.error.message
                        : 'Failed to update profile'}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {address.first_name} {address.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.address_line_1}
                            {address.address_line_2 && `, ${address.address_line_2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No saved addresses yet.
                </p>
              )}

              <Button className="mt-4">
                Add New Address
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                    required
                  />
                </div>

                {changePasswordMutation.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {changePasswordMutation.error instanceof Error
                        ? changePasswordMutation.error.message
                        : 'Failed to change password'}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}