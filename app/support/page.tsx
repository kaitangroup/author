// app/help/page.tsx (Next.js App Router) — drop this file into your Next.js project
// TailwindCSS required. No external UI libraries are used.
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import React from "react";

export default function HelpCenterPage() {
  const categories = [
    {
      title: "Getting Started",
      desc: "Learn the basics and set up your account",
      count: 24,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M6.75 3A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75V8.25a.75.75 0 0 0-.22-.53l-4.5-4.5a.75.75 0 0 0-.53-.22H6.75zM15 4.81 18.19 8H15V4.81z" />
        </svg>
      ),
    },
    {
      title: "Billing & Payments",
      desc: "Manage subscriptions and payment methods",
      count: 18,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M3.75 5.25A2.25 2.25 0 0 1 6 3h12a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 18 21H6a2.25 2.25 0 0 1-2.25-2.25V5.25zM6 6.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6zM6 10.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5H6z" />
        </svg>
      ),
    },
    {
      title: "Account Settings",
      desc: "Customize your profile and preferences",
      count: 32,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M12 2.25a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM3.75 20.25a8.25 8.25 0 0 1 16.5 0 .75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75z" />
        </svg>
      ),
    },
    {
      title: "User Management",
      desc: "Add team members and manage permissions",
      count: 15,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M8.25 8.25a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0zM4.5 20.25a7.5 7.5 0 1 1 15 0 .75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75z" />
        </svg>
      ),
    },
    {
      title: "Security & Privacy",
      desc: "Keep your account safe and secure",
      count: 21,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M12 2.25c-3 2.25-6.75 2.25-6.75 2.25v6.75c0 5.19 3.8 8.67 6.19 9.91a.75.75 0 0 0 .66 0C14.5 19.92 18.75 16.44 18.75 11.25V4.5S15 4.5 12 2.25z" />
        </svg>
      ),
    },
  ];

  const supports = [
    {
      title: "Live Chat",
      desc: "Chat with our support team",
      cta: "Start Chat",
      note: "Available 24/7",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M4.5 3.75A2.25 2.25 0 0 0 2.25 6v7.5A2.25 2.25 0 0 0 4.5 15.75h2.69l3.47 3.47a.75.75 0 0 0 1.28-.53v-2.94h7.56A2.25 2.25 0 0 0 21.75 13.5V6A2.25 2.25 0 0 0 19.5 3.75h-15z" />
        </svg>
      ),
      actionHref: "#",
    },
    {
      title: "Email Support",
      desc: "We'll respond within 24 hours",
      cta: "Send Email",
      note: "support@company.com",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h12a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75zm2.59.53 5.72 4.3a.75.75 0 0 0 .88 0l5.72-4.3A.75.75 0 0 0 18 6H6a.75.75 0 0 0-.66 1.28z" />
        </svg>
      ),
      actionHref: "mailto:support@company.com",
    },
    {
      title: "Phone Support",
      desc: "Speak with a specialist",
      cta: "Call Now",
      note: "Mon–Fri, 9am–6pm EST",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M2.25 5.25A3 3 0 0 1 5.25 2.25h1.5c.62 0 1.16.4 1.33.99l.97 3.23a1.5 1.5 0 0 1-.39 1.5l-1.24 1.24a11.25 11.25 0 0 0 5.52 5.52l1.24-1.24a1.5 1.5 0 0 1 1.5-.39l3.23.97c.59.18.99.71.99 1.33v1.5A3 3 0 0 1 18.75 21.75h-.75C9.31 21.75 2.25 14.69 2.25 6v-.75z" />
        </svg>
      ),
      actionHref: "tel:+10000000000",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-700 to-blue-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">How can we help you?</h1>
          <p className="mt-3 text-white/90">Search our knowledge base or browse categories below</p>
          
        </div>
      </section>

      {/* Browse by Category */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <a
              key={c.title}
              href="#"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  {c.icon}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{c.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-blue-600 group-hover:underline">
                    {c.count} articles
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-xl font-semibold text-gray-900">Still need help?</h2>
          <p className="mt-2 text-center text-gray-600">Our support team is ready to assist you</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {supports.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  {s.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
                <a
                  href={s.actionHref}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
                >
                  {s.cta}
                </a>
                <div className="mt-2 text-xs text-gray-500">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8" />
      <Footer />
    </main>
  );
}
