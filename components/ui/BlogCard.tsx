"use client";
import Image from "next/image";

export interface BlogProps {
    imgSrc: string;
    time: string;
    reads: string;
    title: string;
    content?: string;
}

export const BlogCard: React.FC<BlogProps> = ({imgSrc,time, reads, title, content}) => {
  return (
    <div className="transform hover:scale-105 transition-transform duration-300 flex flex-col gap-4 items-start w-full shadow-lg p-4 rounded-2xl border-none hover:border-b-4 border-r-purple-400 hover:border-orange-500/40">
      <div className="">
        <Image 
        src={imgSrc} 
        alt="blog-img" 
        width={400} 
        height={400} 
        className="rounded-3xl w-full transform hover:scale-100 overflow-hidden transition-transform duration-400" 
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-row gap-6 text-xl font-light">
            <p>{time}</p>
            <p>{reads}</p>
        </div>
        <h1 className="text-2xl font-bold underline">{title}</h1>
         <p className="text-lg font-light text-slate-400">{content}</p>

      </div>
    </div>
  );
};
