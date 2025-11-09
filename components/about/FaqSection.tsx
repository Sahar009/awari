"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { ShieldQuestionMark } from "lucide-react";
import clsx from "clsx";

const faqItems = [
  {
    question: "What makes Awari different from other real estate platforms?",
    answer:
      "Awari brings every stakeholder—renters, buyers, landlords, agents, and hotel providers—onto one platform. Our dashboards, messaging system, and automated workflows keep your property journey organised from discovery to deal closure."
  },
  {
    question: "Can I manage inspections and bookings directly on Awari?",
    answer:
      "Yes. Landlords and agents can sync inspection calendars, send reminders, and approve booking requests in real time. Shortlet providers can also manage check-ins, check-outs, and payment statuses without leaving the dashboard."
  },
  {
    question: "How secure are payments and user data?",
    answer:
      "We partner with trusted payment processors and apply bank-grade encryption across transactions. All user data is protected with role-based access, two-factor ready flows, and automated audit trails for critical actions."
  },
  {
    question: "Is there support for subscription plans and premium listings?",
    answer:
      "Absolutely. Admins can configure subscription plans such as Silver, Gold, or bespoke tiers, and property owners can upgrade to premium visibility. Billing cycles, renewals, and analytics are all handled within the subscription hub."
  },
  {
    question: "Do you offer enterprise or white-label solutions?",
    answer:
      "For enterprise partners we provide tailored onboarding, custom workflows, and dedicated support. Reach out via the contact card below and our partnerships team will set up a discovery call within one business day."
  }
];

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="relative mt-16">
      <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/15 via-secondary-color/10 to-transparent blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/80">
        <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6 text-primary">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur">
              <ShieldQuestionMark size={16} />
              Faqs & Support
            </span>
            <h2 className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
              What would you like to know about the Awari experience?
            </h2>
            <p className="max-w-md text-sm text-primary/80 sm:text-base">
              We designed Awari to feel like a trusted concierge—smart tools, human touch,
              and instant clarity. Browse the answers below or talk to us directly for
              tailored support.
            </p>
            <div className="hidden lg:flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary/80 backdrop-blur">
              <p className="font-medium text-primary">Need a guided tour?</p>
              <p>
                Our success team is on standby to walk you through dashboards, onboarding,
                and integrations. We respond within minutes during business hours.
              </p>
              <a
                href="mailto:hello@awari.com"
                className="inline-flex w-max items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition hover:bg-white/30"
              >
                Contact Support
              </a>
            </div>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => toggleItem(index)}
                  className={clsx(
                    "group w-full overflow-hidden rounded-2xl border transition-colors duration-200 text-left",
                    isActive
                      ? "border-primary/30 bg-primary/5 shadow-lg"
                      : "border-white/30 bg-white/70 hover:bg-white/90 dark:border-slate-700/60 dark:bg-slate-900/80 dark:hover:bg-slate-900"
                  )}
                >
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <h3
                      className={clsx(
                        "text-base font-semibold transition-colors sm:text-lg",
                        isActive ? "text-primary dark:text-primary/80" : "text-slate-900 dark:text-white"
                      )}
                    >
                      {item.question}
                    </h3>
                    <span
                      className={clsx(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-transform",
                        isActive
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-slate-200 bg-white text-slate-400 group-hover:border-primary/30 group-hover:text-primary dark:border-slate-600 dark:bg-slate-800"
                      )}
                    >
                      <ChevronDown
                        className={clsx(
                          "h-4 w-4 transform transition-transform duration-200",
                          isActive ? "rotate-180" : "rotate-0"
                        )}
                      />
                    </span>
                  </div>
                  <div
                    className={clsx(
                      "grid transition-all duration-300 ease-out",
                      isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;


