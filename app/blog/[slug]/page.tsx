import MainLayout from "@/app/mainLayout";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import Container from "@/components/Container";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

const BlogData = [
  {
    slug: "junior-food",
    imgSrc: "/assets/images/slider4.jpg",
    time: "Apr 4 , 2025",
    reads: "3 min read",
    title: "Junior Food",
    content: "We are having a lot of new houses to be posted with more details...",
  },
  {
    slug: "luxury-homes",
    imgSrc: "/assets/images/slider3.jpg",
    time: "Apr 5 , 2025",
    reads: "5 min read",
    title: "Luxury Homes",
    content: "Explore modern houses and architecture design insights...",
  },
  {
    slug: "smart-living",
    imgSrc: "/assets/images/slider2.jpg",
    time: "Apr 6 , 2025",
    reads: "2 min read",
    title: "Smart Living",
    content: "Technology in housing and property automation...",
  },
  {
    slug: "green-spaces",
    imgSrc: "/assets/images/slider1.jpg",
    time: "Apr 7 , 2025",
    reads: "4 min read",
    title: "Green Spaces",
    content: "Eco-friendly property tips and sustainable living...",
  },
];

type BlogDetailProps = {
  params: Promise<{ slug: string }>; // ✅ params is a Promise now
};

// ✅ SEO metadata
export async function generateMetadata(
  { params }: BlogDetailProps
): Promise<Metadata> {
  const { slug } = await params; // ✅ must await
  const blog = BlogData.find((b) => b.slug === slug);

  return {
    title: blog ? blog.title : "Blog Not Found",
    description: blog
      ? blog.content.slice(0, 150)
      : "This blog post could not be found.",
  };
}

// ✅ Page must be async
export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params; // ✅ must await

  const blog = BlogData.find((b) => b.slug === slug);

  if (!blog) {
    return (
      <MainLayout>
        <Container>
          <div className="my-20 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Blog Not Found</h1>
            <p className="text-gray-600 mt-2">
              The blog post you are looking for does not exist.
            </p>
            <Link href="/blog" className="text-primary mt-4 inline-block">
              Back to Blog
            </Link>
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <BreadCrumbs header="Blog Details" location={blog.title} />

      <Container>
        <div className="w-full my-20 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Blog Content */}
            <article className="lg:col-span-3 space-y-6">
              {/* Featured Image */}
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                <Image
                  src={blog.imgSrc}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{blog.time}</span>
                <span>•</span>
                <span>{blog.reads}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                {blog.title}
              </h1>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <p>{blog.content}</p>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 w-full space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Recent Posts
              </h2>
              <div className="space-y-4">
                {BlogData.filter((p) => p.slug !== slug) // ✅ use slug directly
                  .slice(0, 5)
                  .map((post, index) => (
                    <Link
                      href={`/blog/${post.slug}`}
                      key={index}
                      className="flex gap-3 items-center group"
                    >
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={post.imgSrc}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{post.time}</p>
                        <h3 className="text-base font-semibold text-slate-800 group-hover:text-primary line-clamp-1">
                          {post.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}

