"use client";
import MainLayout from '../mainLayout'
import { BreadCrumbs } from '@/components/BreadCrumbs'
import dynamic from 'next/dynamic';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const Properties = dynamic(() => import('@/components/pages/Properties'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

export default function PropertiesPage() {
  return (
    <MainLayout>
        <BreadCrumbs header='Browse all listings' location='Properties'/>
         <Properties/>
    </MainLayout>
  )
}
