"use client";

import React, { useState, useEffect } from 'react';
import Container from "@/components/Container";
import { ArrowLeft, Bell, Shield, Palette, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/useToast';
import MainLayout from "../mainLayout";
import { authService } from '@/services/authService';

const SettingsPageContent = () => {
  const router = useRouter();
  const toast = useToast();
  
  // Settings state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    showLocation: false,
    allowMessages: true,
    allowReviews: true,
    dataSharing: false,
  });

  // Load preferences on mount
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getPreferences();
      if (response.success && response.data) {
        const { notifications, privacy } = response.data;
        
        // Map backend preferences to frontend state
        if (notifications) {
          setNotificationSettings(prev => ({
            ...prev,
            emailNotifications: notifications.email ?? prev.emailNotifications,
            pushNotifications: notifications.push ?? prev.pushNotifications,
            smsNotifications: notifications.sms ?? prev.smsNotifications,
          }));
        }
        
        if (privacy) {
          setPrivacySettings(prev => ({
            ...prev,
            showEmail: privacy.showEmail ?? prev.showEmail,
            showPhone: privacy.showPhone ?? prev.showPhone,
            profileVisible: privacy.profileVisible ?? prev.profileVisible,
          }));
        }
      }
    } catch (error: unknown) {
      console.error('Error loading preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load preferences. Using defaults.';
      toast.error('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadPreferences();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleNotificationUpdate = async () => {
    try {
      setIsSaving(true);
      const response = await authService.updatePreferences({
        notifications: {
          email: notificationSettings.emailNotifications,
          push: notificationSettings.pushNotifications,
          sms: notificationSettings.smsNotifications,
        },
      });

      if (response.success) {
        toast.success('Settings Saved', 'Your notification preferences have been saved.');
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error: unknown) {
      console.error('Error updating notification settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save notification settings.';
      toast.error('Error', errorMessage);
    } finally {
      setIsSaving(false);
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
      setIsSaving(true);
      const response = await authService.updatePreferences({
        privacy: {
          showEmail: privacySettings.showEmail,
          showPhone: privacySettings.showPhone,
          profileVisible: privacySettings.profileVisible ?? true,
        },
      });

      if (response.success) {
        toast.success('Settings Saved', 'Your privacy settings have been saved.');
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error: unknown) {
      console.error('Error updating privacy settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save privacy settings.';
      toast.error('Error', errorMessage);
    } finally {
      setIsSaving(false);
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

            {/* Notification Settings */}
            <section id="notifications" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                {isLoading && (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
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
                  disabled={isSaving || isLoading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Notifications'}
                </button>
              </div>
            </section>

          

            {/* Privacy & Security */}
            <section id="privacy" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
                {isLoading && (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
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
                  disabled={isSaving || isLoading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Privacy Settings'}
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
