import MainLayout from '@/app/mainLayout'
import { BreadCrumbs } from '@/components/BreadCrumbs'
import React from 'react'

export default function BlogDetails() {
  return (
    <MainLayout>
        <BreadCrumbs header='Blog Details' location='Blog details'/>
        
    </MainLayout>
  )
}
