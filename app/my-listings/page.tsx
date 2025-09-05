'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2, Eye, Edit, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import Container from '@/components/Container';

export default function MyListingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);

  // Redirect if not authenticated (check both isAuthenticated and token)
  useEffect(() => {
    // Allow access if user has a token (even if email not verified) or is fully authenticated
    if (!isAuthenticated && !token) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, token, router]);

  return (
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
  );
}
