"use client";
import Image from "next/image"


export const Avatar = () => {
  return (
    <button className="flex flex-col items-center  ">
     <Image
      src={'/assets/images/contruction.png'}
      width={100}
      height={100}
      alt="avatar"
      className="rounded-full w-[40px] h-[40px] object-cover border-0  overflow-hidden"
      />      
    </button>
  )
}
