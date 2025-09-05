"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import Container from "@/components/Container";
import { FaqItem, FaqItemProps } from "@/components/FaqItems";

const faqData: FaqItemProps[] = [
  {
    question: "What services does Awari provide?",
    answer:
      "Awari provides real estate advisory, property management, and investment guidance to help you make informed property decisions.",
  },
  {
    question: "How experienced is the Awari team?",
    answer:
      "Our team has over 20 years of combined experience in real estate, offering trusted expertise and professional advice.",
  },
  {
    question: "Does Awari assist with property investment?",
    answer:
      "Yes, we guide you through every stage of the investment process, from market research to property acquisition.",
  },
  {
    question: "Can I book a consultation online?",
    answer:
      "Absolutely! You can schedule a consultation through our website or by contacting us directly via email or phone.",
  },
];

export default function FAQ() {
  return (
    <MainLayout>
      <BreadCrumbs header="FAQ" location="FAQ" />
      <Container>
        <section className="w-full mx-auto px-4 py-16">
          <div className="w-full flex flex-col gap-4 items-center">
            <p className="text-xl font-light getintouch text-slate-700">Need Help?</p>
            <h1 className="md:text-4xl text-3xl text-center font-bold text-slate-900">
              Frequently Asked Questions
            </h1>
          </div>
          <div className="flex flex-col gap-6">
            {faqData.map((data, index) => (
              <FaqItem
                key={index}
                question={data.question}
                answer={data.answer}
              />
            ))}
          </div>
        </section>
      </Container>
    </MainLayout>
  );
}
