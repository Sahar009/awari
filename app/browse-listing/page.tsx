"use client";
import Properties from '@/pages/properties/Properties';
import MainLayout from '../mainLayout'
import { BreadCrumbs } from '@/components/BreadCrumbs'


export default function PropertiesPage() {
  return (
    <MainLayout>
        <BreadCrumbs header='Browse Listing' location='Properties'/>
         <Properties/>
    </MainLayout>
  )
}
