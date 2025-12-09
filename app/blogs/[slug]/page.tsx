"use client";

import { wordpressAPI } from "@/lib/wordpress";
import { BlogDetailView } from "@/components/blog/blog-detail-view";
import { notFound } from "next/navigation";
import type { BlogPost } from "@/lib/wordpress";
import { useParams, useRouter } from 'next/navigation';
import React from "react";

export default function BlogPage() {
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const params = useParams();
  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        if (typeof params.slug !== 'string') {
          notFound();
          return;
        }
        const fetchedPost = await wordpressAPI.getPost(params.slug);
        if (!fetchedPost) notFound();
        setPost(fetchedPost);
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return <BlogDetailView post={post} />;
}
