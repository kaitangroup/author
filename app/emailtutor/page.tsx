
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import emaImage from "./image/hero-extracurricular.jpg";

export default function RequestTutorPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
        {/* Background image — change the path if needed */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${emaImage.src})`, }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Centered content */}
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          <div className="px-4 text-center max-w-5xl">
            <h1 className="text-white tracking-tight font-semibold leading-tight">
              <span className="block text-4xl sm:text-5xl md:text-6xl">REQUEST A TUTOR</span>
            </h1>
            <p className="mt-3 text-green-500 text-base md:text-lg">
              Answer a few quick questions. We'll help you find tutors in your area.
            </p>
            <div className="mt-6">
              <a
                  href="/search"
                  className="inline-flex items-center justify-center h-11 rounded-md 
                            bg-blue-600 hover:bg-blue-700 
                            px-8 text-sm font-medium text-white 
                            transition-colors duration-150 ease-in-out"
                >
                  Get Started
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* HEADLINE + FEATURES */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900 leading-snug">
            Learn from the nation’s largest community of
            <br className="hidden sm:block" /> professional tutors.
          </h2>
        </div>

        {/* Feature trio */}
        <div className="mx-auto max-w-5xl mt-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Feature 1 */}
          <div className="text-center">
            {/* people icon */}
            <svg className="mx-auto h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4Z" strokeWidth="1.5"/>
              <path d="M8 11c1.657 0 3-1.79 3-4S9.657 3 8 3 5 4.79 5 7s1.343 4 3 4Z" strokeWidth="1.5"/>
              <path d="M4 21v-1a5 5 0 0 1 5-5h0" strokeWidth="1.5"/>
              <path d="M15 15h1a5 5 0 0 1 5 5v1" strokeWidth="1.5"/>
            </svg>
            <h3 className="mt-4 text-sm font-bold tracking-wide text-gray-900">VETTED EXPERTS.</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              More qualified instructors than anywhere else, ready to help.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            {/* puzzle icon */}
            <svg className="mx-auto h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 7h4a2 2 0 1 0-2-2V3H5a2 2 0 0 0-2 2v4h2a2 2 0 1 1 2 2v4h4a2 2 0 1 1 2 2h4a2 2 0 0 0 2-2v-4h-2a2 2 0 1 1-2-2V7h-4" strokeWidth="1.5"/>
            </svg>
            <h3 className="mt-4 text-sm font-bold tracking-wide text-gray-900">THE RIGHT FIT.</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Find an expert who suits your needs and learning style.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            {/* chart icon */}
            <svg className="mx-auto h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="12" rx="2" strokeWidth="1.5"/>
              <path d="M7 13l3-3 2 2 4-4" strokeWidth="1.5"/>
            </svg>
            <h3 className="mt-4 text-sm font-bold tracking-wide text-gray-900">REAL RESULTS.</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Reach your goals faster with private, 1-to-1 lessons.
            </p>
          </div>
        </div>
      </section>

      {/* Anchor target */}
      <div id="get-started" className="sr-only" />
      <Footer />
    </main>
  );
}
