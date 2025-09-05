'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import Container from '@/components/Container';
import MainLayout from '../mainLayout';
import { AuthLoader } from '@/components/ui/Loader';

export default function MyListingsPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // const hasAccess = isAuthenticated || !!token;
  
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const currentHasAccess = isAuthenticated || !!token || !!localToken;
      
      console.log('=== MY LISTINGS AUTH DEBUG ===');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('token:', token);
      console.log('localToken:', !!localToken);
      console.log('currentHasAccess:', currentHasAccess);
      console.log('==============================');
      
      if (!currentHasAccess) {
        console.log('Redirecting to login - no access');
        router.push('/auth/login');
      }
      
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [isAuthenticated, token, router]);

  // Show loading while checking auth
  if (!authChecked) {
    return <AuthLoader />;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pt-20">
        <Container>
          <div className="py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">My Listings</h1>
                <p className="text-slate-600 mt-2">Manage your property listings</p>
              </div>
              <button
                onClick={() => router.push('/add-property')}
                className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Property</span>
              </button>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">No properties yet</h2>
              <p className="text-slate-600 mb-6">Start by adding your first property listing</p>
              <button
                onClick={() => router.push('/add-property')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Property</span>
              </button>
            </div>
          </div>
        </Container>
      </div>
    </MainLayout>
  );
}
