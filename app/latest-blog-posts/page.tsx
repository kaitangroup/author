"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MessageSquare, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { wordpressAPI, type BlogPost } from "@/lib/wordpress"; // your WP wrapper

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // fetch latest 3 posts
        const api = new (wordpressAPI as any).constructor({ postsPerPage: 3 });
        const { posts } = await api.getPosts(1);
        setPosts(posts);
      } catch (e: any) {
        setError(e?.message || "Failed to load posts");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover the Best Educational Resources
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            Author Resources features free content created by the largest network of private authors on the web{" "}
            <span className="text-blue-600">Explore and collaborate to start learning today!</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg p-8 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-white/90 rounded-lg p-4 w-16 h-16 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ask An Expert</h2>
            <p className="text-white text-sm">
              Ask questions and get free answers from expert authors
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-8 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-white/90 rounded-lg p-4 w-16 h-16 flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Author Blog</h2>
            <p className="text-white text-sm">
              Learn what's happening in the world of private authoring
            </p>
          </div>
        </div>

        {/* Latest Blog Posts (Dynamic from WordPress) */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Blog Posts</h2>

          {/* Error */}
          {error && (
            <div className="text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Loading skeletons */}
          {!posts && !error && (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="bg-gray-200 h-48" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Posts */}
          {posts && (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post) => {
                const img =
                  post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                  "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop";

                const title = post.title?.rendered || "Untitled";
                const alt =
                  post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || "Blog image";

                return (
                  <Link
                    key={post.id}
                    href={`/latest-blog-posts/${post.slug}`}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group">
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-0 h-48 flex items-center justify-center overflow-hidden">
                        <img
                          src={img}
                          alt={alt}
                          className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6">
                        <h3
                          className="text-lg font-semibold text-blue-600 hover:underline mb-2"
                          dangerouslySetInnerHTML={{ __html: title }}
                        />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* <section className="bg-white rounded-lg shadow-md p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Looking for an expert tutor?
          </h2>
          <p className="text-gray-700 mb-8">
            Get the help you need with private, 1-on-1 lessons from an expert instructor of your choice.
          </p>

          <div className="mb-6">
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              What would you like to learn?
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter a subject"
                className="flex-1"
              />
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                GET HELP
              </Button>
            </div>
          </div>
        </section> */}
      </div>

      <Footer />
    </div>
  );
}
