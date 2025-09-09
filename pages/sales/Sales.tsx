"use client";
import Container from '@/components/Container'
import { SearchFilter } from '@/components/SearchFilter'
import { Card } from '@/components/ui/Card'
import React from 'react'
import { demoCards } from '../home/FeatureList'

 const Sales = () => {
  return (
     <Container>
          <div className="my-15 flex flex-col gap-10">
            <SearchFilter />
            <div className="w-full grid md:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] grid-cols-2 md:gap-6 gap-3">
              {demoCards.map((data, index) => (
                <div key={index}>
                  <Card
                    ImageSrc={data.ImageSrc}
                    Title={data.Title}
                    description={data.description}
                    price={data.price}
                    liked={data.liked}
                    location={data.location}
                    type={data.type}
                  />
                </div>
              ))}
            </div>
          </div>
        </Container>
  )
}

export default Sales;
