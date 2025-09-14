"use client";

import React, { useState } from 'react';
import Container from "@/components/Container";
import { ArrowLeft, User, Bell, Shield, Palette, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/useToast';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import MainLayout from "../mainLayout";

const SettingsPageContent = () => {
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector(selectUser);
  
  // Settings state
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    location: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    propertyAlerts: true,
    priceDrops: true,
    newListings: true,
    bookingUpdates: true,
    maintenanceReminders: true,
  });

  const [preferenceSettings, setPreferenceSettings] = useState({
    newsletter: true,
    language: 'en',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    theme: 'light',
    autoSave: true,
    twoFactorAuth: false,
    publicProfile: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: false,
    allowMessages: true,
    allowReviews: true,
    dataSharing: false,
  });

  const handleProfileUpdate = async () => {
    try {
      // TODO: Implement profile update API call
      toast.success('Profile Updated', 'Your profile has been updated successfully.');
    } catch {
      toast.error('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      // TODO: Implement notification settings API call
      toast.success('Settings Saved', 'Your notification preferences have been saved.');
    } catch {
      toast.error('Error', 'Failed to save notification settings.');
    }
  };

  const handlePreferenceUpdate = async () => {
    try {
      // TODO: Implement preference settings API call
      toast.success('Settings Saved', 'Your preferences have been saved.');
    } catch {
      toast.error('Error', 'Failed to save preferences.');
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      // TODO: Implement privacy settings API call
      toast.success('Settings Saved', 'Your privacy settings have been saved.');
    } catch {
      toast.error('Error', 'Failed to save privacy settings.');
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion with confirmation modal
    toast.error('Feature Coming Soon', 'Account deletion feature will be available soon.');
  };

  const toggleSetting = (category: string, setting: string) => {
    switch (category) {
      case 'notification':
        setNotificationSettings(prev => ({
          ...prev,
          [setting]: !prev[setting as keyof typeof prev]
        }));
        break;
      case 'preference':
        setPreferenceSettings(prev => ({
          ...prev,
          [setting]: !prev[setting as keyof typeof prev]
        }));
        break;
      case 'privacy':
        setPrivacySettings(prev => ({
          ...prev,
          [setting]: !prev[setting as keyof typeof prev]
        }));
        break;
    }
  };

  const SettingToggle = ({ 
    category, 
    setting, 
    label, 
    description 
  }: { 
    category: string; 
    setting: string; 
    label: string; 
    description?: string; 
  }) => {
    const isEnabled = category === 'notification' 
      ? notificationSettings[setting as keyof typeof notificationSettings]
      : category === 'preference'
      ? preferenceSettings[setting as keyof typeof preferenceSettings]
      : privacySettings[setting as keyof typeof privacySettings];

    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{label}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={() => toggleSetting(category, setting)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8 mt-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <nav className="space-y-2">
                <a href="#profile" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  Profile
                </a>
                <a href="#notifications" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  Notifications
                </a>
                <a href="#preferences" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Palette className="w-5 h-5" />
                  Preferences
                </a>
                <a href="#privacy" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </a>
                <a href="#account" className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                  Account
                </a>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <section id="profile" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileSettings.lastName}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileSettings.bio}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profileSettings.location}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleProfileUpdate}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </section>

            {/* Notification Settings */}
            <section id="notifications" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Communication</h3>
                  <SettingToggle
                    category="notification"
                    setting="emailNotifications"
                    label="Email Notifications"
                    description="Receive notifications via email"
                  />
                  <SettingToggle
                    category="notification"
                    setting="pushNotifications"
                    label="Push Notifications"
                    description="Receive push notifications on your device"
                  />
                  <SettingToggle
                    category="notification"
                    setting="smsNotifications"
                    label="SMS Notifications"
                    description="Receive notifications via SMS"
                  />
                  <SettingToggle
                    category="notification"
                    setting="marketingEmails"
                    label="Marketing Emails"
                    description="Receive promotional emails and offers"
                  />
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Property Updates</h3>
                  <SettingToggle
                    category="notification"
                    setting="propertyAlerts"
                    label="Property Alerts"
                    description="Get notified about new properties matching your criteria"
                  />
                  <SettingToggle
                    category="notification"
                    setting="priceDrops"
                    label="Price Drop Alerts"
                    description="Get notified when prices drop on your saved properties"
                  />
                  <SettingToggle
                    category="notification"
                    setting="newListings"
                    label="New Listings"
                    description="Get notified about new listings in your area"
                  />
                  <SettingToggle
                    category="notification"
                    setting="bookingUpdates"
                    label="Booking Updates"
                    description="Get notified about booking status changes"
                  />
                  <SettingToggle
                    category="notification"
                    setting="maintenanceReminders"
                    label="Maintenance Reminders"
                    description="Get reminded about property maintenance"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleNotificationUpdate}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Notifications
                </button>
              </div>
            </section>

            {/* Preferences */}
            <section id="preferences" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
              </div>

              <div className="space-y-4">
                <SettingToggle
                  category="preference"
                  setting="newsletter"
                  label="Newsletter Subscription"
                  description="Subscribe to our weekly newsletter with property insights"
                />
                
                <SettingToggle
                  category="preference"
                  setting="autoSave"
                  label="Auto-save Drafts"
                  description="Automatically save your property listings as drafts"
                />

                <SettingToggle
                  category="preference"
                  setting="twoFactorAuth"
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                />

                <SettingToggle
                  category="preference"
                  setting="publicProfile"
                  label="Public Profile"
                  description="Make your profile visible to other users"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={preferenceSettings.language}
                      onChange={(e) => setPreferenceSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={preferenceSettings.currency}
                      onChange={(e) => setPreferenceSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePreferenceUpdate}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </section>

            {/* Privacy & Security */}
            <section id="privacy" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
              </div>

              <div className="space-y-4">
                <SettingToggle
                  category="privacy"
                  setting="showEmail"
                  label="Show Email"
                  description="Allow other users to see your email address"
                />
                
                <SettingToggle
                  category="privacy"
                  setting="showPhone"
                  label="Show Phone"
                  description="Allow other users to see your phone number"
                />
                
                <SettingToggle
                  category="privacy"
                  setting="showLocation"
                  label="Show Location"
                  description="Allow other users to see your location"
                />
                
                <SettingToggle
                  category="privacy"
                  setting="allowMessages"
                  label="Allow Messages"
                  description="Allow other users to send you messages"
                />
                
                <SettingToggle
                  category="privacy"
                  setting="allowReviews"
                  label="Allow Reviews"
                  description="Allow other users to review your properties"
                />
                
                <SettingToggle
                  category="privacy"
                  setting="dataSharing"
                  label="Data Sharing"
                  description="Allow sharing data for improved services"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrivacyUpdate}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Privacy Settings
                </button>
              </div>
            </section>

            {/* Account Management */}
            <section id="account" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trash2 className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">Account Management</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Export Your Data</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Download a copy of all your data including properties, favorites, and account information.
                  </p>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                    Export Data
                  </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Container>
  );
};

const SettingsPage = () => {
  return (
    <MainLayout>
      <SettingsPageContent />
    </MainLayout>
  );
};

export default SettingsPage;
