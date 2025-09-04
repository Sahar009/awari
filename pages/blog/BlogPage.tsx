"use client";

import { useState } from "react";
import Container from "@/components/Container";
import { BlogCard, BlogProps } from "@/components/ui/BlogCard";

const BlogData: BlogProps[] = [
  {
    imgSrc: "/assets/images/slider4.jpg",
    time: " Apr 4 , 2025",
    reads: "3 min read",
    title: "Shortlets Aparment",
    content: "There are new shortlet apartment available in Ibadan right now ",
  },
  {
    imgSrc: "/assets/images/slider4.jpg",
    time: " Apr 4 , 2025",
    reads: "3 min read",
    title: "Luxury Apartments",
    content: "Discover stunning apartments with modern design and comfort.",
  },
  {
    imgSrc: "/assets/images/slider4.jpg",
    time: " Apr 4 , 2025",
    reads: "4 min read",
    title: "Real Estate Growth",
    content: "The market is booming, with new investment opportunities daily.",
  },
  {
    imgSrc: "/assets/images/slider4.jpg",
    time: " Apr 5 , 2025",
    reads: "2 min read",
    title: "Interior Trends",
    content: "Explore the latest interior design inspirations of 2025.",
  },
  {
    imgSrc: "/assets/images/slider4.jpg",
    time: " Apr 6 , 2025",
    reads: "5 min read",
    title: "Eco-Friendly Homes",
    content: "Green buildings are redefining modern sustainable living.",
  },
  {
    imgSrc: "/assets/images/slider4.jpg",
    time: " Apr 7 , 2025",
    reads: "3 min read",
    title: "Property Sales",
    content: "Why buying now might be the best decision for your future.",
  },
];

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 3; // 👈 how many blogs per page

  // Calculate pagination indexes
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = BlogData.slice(indexOfFirstBlog, indexOfLastBlog);

  const totalPages = Math.ceil(BlogData.length / blogsPerPage);

  return (
    <Container>
      <div className="w-full my-20 space-y-8">
        {/* Header */}
        <div className="w-full flex flex-col gap-4 items-center ">
          <p className="text-xl font-light getintouch text-slate-700">
            News & Blog
          </p>
          <h1 className="md:text-4xl text-3xl text-center font-bold text-slate-900">
            READ OUR INSIGHTS
          </h1>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] w-full gap-6">
          {currentBlogs.map((data, index) => (
            <div key={index}>
              <BlogCard
                imgSrc={data.imgSrc}
                time={data.time}
                reads={data.reads}
                title={data.title}
                content={data.content}
              />
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-3 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-lg  text-purple-300 border border-purple-300 text-sm ${
              currentPage === 1
                  ? " cursor-not-allowed"
                : "bg-white border-gray-300 hover:bg-primary hover:text-white transition-colors duration-400"
            }`}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                currentPage === i + 1
                  ? "bg-primary text-white"
                  : "bg-white border-gray-300  transition-colors duration-400 hover:bg-primary hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-lg text-purple-300 border border-purple-300 text-sm ${
              currentPage === totalPages
                ? " cursor-not-allowed"
                : "bg-white border-gray-300  transition-colors duration-400 hover:bg-primary hover:text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </Container>
  );
};

export default BlogPage;
