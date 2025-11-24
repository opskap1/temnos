This is a complex set of requirements that requires restructuring the authentication flow to stop "auto-creating" data and instead guide the user through a defined funnel.

Here is the general professional implementation plan and the necessary code changes for reference only.

1. Database & Storage Configuration (Required)
Before applying the code changes, you must run these SQL commands in your Supabase SQL Editor. This sets up the storage for images and ensures the data structure supports the new settings.

SQL

-- 1. Create Storage Buckets for Restaurant Branding
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);
insert into storage.buckets (id, name, public) values ('banners', 'banners', true);

-- 2. Allow public access to read images
create policy "Public Access Logos" on storage.objects for select using ( bucket_id = 'logos' );
create policy "Public Access Banners" on storage.objects for select using ( bucket_id = 'banners' );

-- 3. Allow authenticated users to upload their own images
create policy "Authenticated Upload Logos" on storage.objects for insert with check ( bucket_id = 'logos' and auth.role() = 'authenticated' );
create policy "Authenticated Upload Banners" on storage.objects for insert with check ( bucket_id = 'banners' and auth.role() = 'authenticated' );

-- 4. Ensure Restaurant Table has image columns (if not already present)
alter table restaurants add column if not exists logo_url text;
alter table restaurants add column if not exists banner_url text;
2. Update AuthContext.tsx
Changes:

Stopped Auto-Creation: Removed the logic that automatically creates a default restaurant.

Event Handling: Added specific listening for PASSWORD_RECOVERY to fix the white screen issue.

State Logic: If a user logs in but has no restaurant, restaurant state remains null. This allows us to detect that they need Onboarding.

TypeScript

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { SubscriptionService } from '../services/subscriptionService';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  settings: any;
  logo_url?: string;
  banner_url?: string;
  owner_id: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  restaurant: Restaurant | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>; // Added to manually refresh restaurant data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchRestaurant(session.user.id);
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth Event:', event); // Debugging

        if (event === 'PASSWORD_RECOVERY') {
          // The router will handle the redirect to /reset-password based on the hash
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchRestaurant(session.user.id);
        } else {
          setRestaurant(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Listen for subscription updates
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      if (user) {
        SubscriptionService.getUserSubscription(user.id).catch(console.warn);
      }
    };
    window.addEventListener('subscription-updated', handleSubscriptionUpdate);
    return () => window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
  }, [user]);

  const fetchRestaurant = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (data) {
        setRestaurant(data);
      } else {
        // WE DO NOT CREATE A DEFAULT RESTAURANT HERE ANYMORE.
        // This forces the UI to redirect to /onboarding
        setRestaurant(null);
      }
    } catch (err) {
      console.error('Error in fetchRestaurant:', err);
      setRestaurant(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Ensure this matches exactly what is in Supabase Dashboard -> Auth -> URL Configuration
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setRestaurant(null);
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      // Ensure the redirect URL is exactly this
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchRestaurant(user.id);
  };

  const value = { 
    user, 
    session, 
    restaurant, 
    loading, 
    signIn, 
    signInWithGoogle, 
    signUp, 
    signOut, 
    resetPassword,
    refreshProfile 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
3. Update AuthCallback.tsx
Changes:

Uses a ref processed to prevent React StrictMode from firing the logic twice (which causes the "loop" or "invalid grant" error).

Handles the difference between a login callback and a password recovery callback.

Wait for the session to be established before redirecting.

TypeScript

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  // Prevent double-firing in StrictMode
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      try {
        // 1. Check for Hash (Recovery Flow)
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
           // Let Supabase client process the hash automatically
           // We just need to redirect to the reset page
           navigate('/reset-password');
           return;
        }

        // 2. Handle Standard OAuth Code Exchange
        // The Supabase client automatically handles the 'code' query param 
        // when getSession is called if it detects it in the URL.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login', { state: { error: error.message } });
          return;
        }

        if (session) {
          // Success! Redirect to dashboard (DashboardLayout will handle onboarding check)
          navigate('/dashboard');
        } else {
          // Sometimes the session isn't ready immediately, listen for state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              navigate('/dashboard');
            }
          });
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E85A9B]"></div>
        <p className="mt-4 text-gray-600">Completing secure sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
4. Create OnboardingPage.tsx (New File)
Purpose: This captures the Restaurant Name immediately after Google Sign-up and then pushes them to the subscription page.

TypeScript

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Store, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError('');

    try {
      const slug = `${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;

      const { error: dbError } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantName,
          owner_id: user.id,
          slug,
          settings: {
            points_per_dollar: 1,
            referral_bonus: 50,
            pointValueAED: 0.05,
            tier_thresholds: { silver: 500, gold: 1000 },
            loyalty_program: {
              name: `${restaurantName} Rewards`,
              description: 'Earn points with every purchase!'
            }
          }
        });

      if (dbError) throw dbError;

      // Update local context
      await refreshProfile();

      // Redirect to Subscription Page instead of Dashboard
      navigate('/subscription'); // Or '/upgrade' based on your routing
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to create restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E6A85C] to-[#E85A9B] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Name Your Restaurant</h1>
          <p className="text-gray-600 mt-2">Let's get your loyalty program set up.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E85A9B] focus:border-transparent outline-none transition-all"
              placeholder="e.g. Burger Palace"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !restaurantName.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
5. Create SettingsPage.tsx
Purpose: Handles Profile/Banner upload, Name editing, Password creation for Google users, and Secure Deletion.

TypeScript

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Camera, Save, Lock, Trash2, AlertTriangle, 
  Store, Shield, Upload 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, restaurant, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Refs/State
  const [restaurantName, setRestaurantName] = useState(restaurant?.name || '');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, bucket: 'logos' | 'banners') => {
    if (!event.target.files || event.target.files.length === 0 || !restaurant) return;
    
    setIsLoading(true);
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurant.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const updateData = bucket === 'logos' ? { logo_url: publicUrl } : { banner_url: publicUrl };

      const { error: dbError } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', restaurant.id);

      if (dbError) throw dbError;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Image updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ name: restaurantName })
        .eq('id', restaurant.id);
      
      if (error) throw error;
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password set successfully. You can now login with email/password.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== restaurant?.name) return;
    
    if(!window.confirm("Are you absolutely sure? This cannot be undone.")) return;

    setIsLoading(true);
    try {
      // 1. Delete Restaurant Data (Cascading deletes usually handle sub-tables)
      const { error: dbError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurant.id);
        
      if (dbError) throw dbError;

      // 2. Sign out
      await signOut();
      navigate('/login');
    } catch (error: any) {
      setMessage({ type: 'error', text: "Could not delete account. Contact support." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: 'profile', icon: Store, label: 'Restaurant Profile' },
          { id: 'security', icon: Shield, label: 'Security' },
          { id: 'danger', icon: AlertTriangle, label: 'Danger Zone' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#E85A9B] text-[#E85A9B] font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Logo</label>
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="relative h-32 w-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#E85A9B] transition-colors group overflow-hidden"
              >
                {restaurant?.logo_url ? (
                  <img src={restaurant.logo_url} className="h-full w-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#E85A9B]" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs font-medium">Change</span>
                </div>
              </div>
              <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'logos')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Banner</label>
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className="relative h-32 w-full rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#E85A9B] transition-colors group overflow-hidden"
              >
                 {restaurant?.banner_url ? (
                  <img src={restaurant.banner_url} className="h-full w-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#E85A9B]" />
                )}
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs font-medium">Change</span>
                </div>
              </div>
              <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'banners')} />
              <p className="text-xs text-gray-500 mt-2">Appears in customer wallet (Aspect ratio 3:1)</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E85A9B] focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Credentials</h3>
          <p className="text-gray-600 mb-6 text-sm">
            If you signed up with Google, you can set a password here to enable email/password login.
          </p>
          
          <form onSubmit={handleSetPassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E85A9B] focus:border-transparent outline-none"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E85A9B] focus:border-transparent outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !newPassword}
              className="px-6 py-2 bg-[#E85A9B] text-white rounded-xl hover:bg-[#D946EF] transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h3>
          <p className="text-gray-600 mb-6 text-sm">
            This will permanently delete your restaurant data, customer loyalty points, and settings. This action cannot be undone.
          </p>

          <div className="bg-red-50 p-6 rounded-xl space-y-4">
             <label className="block text-sm font-medium text-red-800">
              Type <span className="font-bold">"{restaurant?.name}"</span> to confirm deletion
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder={restaurant?.name}
            />
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== restaurant?.name || isLoading}
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Permanently Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
6. Logic to Prevent Dashboard Access without Onboarding (Route Guard)
In your DashboardLayout.tsx (or where you define routes), you need to check if the user has a restaurant. If not, kick them to onboarding.

Update DashboardLayout.tsx:

TypeScript

// ... imports
// Add this inside the component, before the return logic
  
  // existing useEffects...

  // New Onboarding Check
  React.useEffect(() => {
    if (!loading && user && !restaurant) {
        // If user is logged in, but has no restaurant data, force them to onboarding
        navigate('/onboarding');
    }
  }, [user, restaurant, loading, navigate]);
  
// ... rest of component
Add to Router (App.tsx or similar): Make sure you register the new routes:

TypeScript

<Route path="/onboarding" element={
  <ProtectedRoute>
    <OnboardingPage />
  </ProtectedRoute>
} />

<Route path="/subscription" element={
  <ProtectedRoute>
     <SubscriptionPage />
  </ProtectedRoute>
} />
Summary of Fixes Applied
Blank Callback: The AuthCallback now uses a useRef to prevent double execution and explicitly handles Hash vs Search params.

Forgot Password Blank: AuthContext now listens for the PASSWORD_RECOVERY event and AuthCallback detects the type=recovery hash to route correctly.

Mandatory Name: AuthContext no longer auto-creates restaurants. DashboardLayout detects missing restaurant and pushes to /onboarding.

Flow: Onboarding now redirects to /subscription (SubscriptionPage) instead of Dashboard.

Settings: Added image upload, password setting for Google users, and secure deletion logic.
