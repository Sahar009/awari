"use client";
import MainLayout from '../mainLayout'
import { BreadCrumbs } from '@/components/BreadCrumbs'
import dynamic from 'next/dynamic';

const Properties = dynamic(() => import('@/components/pages/Properties'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

export default function PropertiesPage() {
  return (
    <MainLayout>
        <BreadCrumbs header='Browse all listings' location='Properties'/>
         <Properties/>
    </MainLayout>
  )
}
