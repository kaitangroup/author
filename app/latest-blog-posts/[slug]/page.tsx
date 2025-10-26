// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { wordpressAPI, type BlogPost } from "@/lib/wordpress";
import { CalendarDays, User, Share2, ArrowLeft } from "lucide-react";

// ------- utils -------
function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function stripHtml(html = "") {
  return html.replace(/<style[\s\S]*?<\/style>/gi, "")
             .replace(/<script[\s\S]*?<\/script>/gi, "")
             .replace(/<[^>]+>/g, " ")
             .replace(/\s+/g, " ")
             .trim();
}

function estimateReadingTime(html = "") {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200)); // ~200 wpm
  return `${minutes} min read`;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const post = await wordpressAPI.getPost(params.slug);
    if (!post) return { title: "Post not found" };

    const titlePlain = stripHtml(post.title?.rendered || "Post");
    const descPlain =
      stripHtml(post.excerpt?.rendered || "").slice(0, 160) || titlePlain;

    const ogImg = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

    return {
      title: `${titlePlain} | Modern Blog Reader`,
      description: descPlain,
      openGraph: {
        title: titlePlain,
        description: descPlain,
        images: ogImg ? [ogImg] : [],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: titlePlain,
        description: descPlain,
        images: ogImg ? [ogImg] : [],
      },
    };
  } catch {
    return { title: "Post not found" };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post: BlogPost | null = null;

  try {
    post = await wordpressAPI.getPost(params.slug);
  } catch (e) {
    console.error("Error loading blog post:", e);
  }

  if (!post) {
    notFound();
  }

  const title = post!.title?.rendered ?? "Untitled";
  const dateIso = post!.date;
  const dateLabel = formatDate(dateIso);
  const authorName = post!._embedded?.author?.[0]?.name || "Unknown author";
  const authorAvatar = post!._embedded?.author?.[0]?.avatar_urls?.["96"] || "";
  const featured = post!._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
  const featuredAlt = post!._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || "Featured image";
  const readingTime = estimateReadingTime(post!.content?.rendered || "");

  // Best-effort canonical link
  const wpLink =
    (post as unknown as { link?: string })?.link ||
    `https://authorsback.rolandjones.com/?p=${post!.id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="relative">
        {featured ? (
          <div className="relative h-[38rem] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured}
              alt={featuredAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-10">
              <div className="mb-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
              <h1
                className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm"
                dangerouslySetInnerHTML={{ __html: title }}
              />
              <div className="mt-6 flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  {authorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="h-8 w-8 rounded-full ring-2 ring-white/20"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="text-sm">{authorName}</span>
                </div>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  <time className="text-sm" dateTime={dateIso}>{dateLabel}</time>
                </div>
                <span className="text-white/40">•</span>
                <div className="text-sm">{readingTime}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-10">
              <div className="mb-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
              <h1
                className="text-3xl md:text-5xl font-extrabold tracking-tight text-white"
                dangerouslySetInnerHTML={{ __html: title }}
              />
              <div className="mt-6 flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  {authorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="h-8 w-8 rounded-full ring-2 ring-white/20"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="text-sm">{authorName}</span>
                </div>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  <time className="text-sm" dateTime={dateIso}>{dateLabel}</time>
                </div>
                <span className="text-white/40">•</span>
                <div className="text-sm">{readingTime}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 pb-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-8">
          {/* Article */}
          <article className="prose prose-lg prose-blue max-w-none bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 md:p-8">
            <div
              dangerouslySetInnerHTML={{ __html: post!.content?.rendered || "" }}
            />
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-10 h-fit">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Share2 className="h-5 w-5" /> Share
              </h3>
              <div className="space-y-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(wpLink)}&text=${encodeURIComponent(stripHtml(title))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  Share on X (Twitter)
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wpLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  Share on Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(wpLink)}&title=${encodeURIComponent(stripHtml(title))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  Share on LinkedIn
                </a>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">About the author</h3>
              <div className="flex items-center gap-3">
                {authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 grid place-items-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{authorName}</p>
                  {dateLabel && (
                    <p className="text-xs text-gray-500">Published {dateLabel}</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            View all posts →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Always fetch fresh content
export const dynamic = "force-dynamic";
