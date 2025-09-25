"use client";

import { useEffect, useState } from "react";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchPosts() {
    try {
      const res = await fetch(
        "http://hcms.me/wp-json/wp/v2/posts?per_page=10&_embed" // ✅ সঠিক এন্ডপয়েন্ট
      );
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }
  fetchPosts();
}, []);


  if (loading) return <p className="text-center mt-10">Loading posts...</p>;

  if (posts.length === 0) return <p className="text-center mt-10">No posts found.</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">WordPress Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => {
          // Featured image url
          const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
          const imageUrl = featuredMedia?.source_url || "/placeholder-image.png";

          return (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <a href={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  alt={post.title.rendered.replace(/<[^>]+>/g, "")}
                  className="w-full h-48 object-cover"
                />
              </a>
              <div className="p-4 flex flex-col flex-grow">
                <h2
                  className="text-xl font-semibold mb-2 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                ></h2>
                <div
                  className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                ></div>
                <a
                 href={`/post/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Read More
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
