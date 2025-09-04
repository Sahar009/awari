import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import BlogPage from "@/pages/blog/BlogPage";


export default function Blog() {
  return (
    <MainLayout>
     <BreadCrumbs header="Featured post" location="Blog"/>
     <BlogPage/>
    </MainLayout>
  )
}
