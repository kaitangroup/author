import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import heroImage from "./image/careers-hero.jpg";

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      {/* HERO */}
      <section
        className="relative h-[70vh] min-h-[520px] w-full overflow-hidden"
      >
        {/* Background image (replace the URL with your own) */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url(${heroImage.src})`,
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Centered content */}
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          <div className="px-4 text-center max-w-5xl">
            <h1 className="font-semibold leading-tight text-white tracking-tight">
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                COME HELP US BUILD A
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">
                <span className="text-green-500">BETTER</span>
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">
                <span className="text-green-500">WAY TO LEARN</span>
              </span>
            </h1>

            <div className="mt-8">
              <a
                href="/contact"
                className="inline-block rounded-md border border-white/80 bg-transparent px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
              >
                Open Positions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COPY BLOCK */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-orange-500 mb-6">
            It Takes a Team
          </h2>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            Our team is full of smart, motivated people with a passion for creating and supporting the best
            educational technology possible. Millions of users count on us to make learning as effective as
            can be, so we’re looking for exceptional people who are committed to solving the real-world
            challenges faced by students and teachers around the world.
          </p>
        </div>
      </section>

      {/* OPTIONAL: Open Positions anchor target */}
      <div id="open-positions" className="sr-only" />
      <Footer />
    </main>
  );
}
