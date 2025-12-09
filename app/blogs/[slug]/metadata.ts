import { wordpressAPI } from "@/lib/wordpress";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await wordpressAPI.getPost(params.slug);

    if (!post) return { title: "Post Not Found" };

    const cleanExcerpt =
      post.excerpt?.rendered
        ?.replace(/<[^>]*>/g, "")
        ?.replace(/&nbsp;/g, " ")
        ?.trim()
        ?.substring(0, 160) || "";

    const featuredImage =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? undefined;

    return {
      title: `${post.title?.rendered ?? "Untitled"} | Modern Blog Reader`,
      description: cleanExcerpt,
      openGraph: {
        title: post.title?.rendered ?? "Untitled",
        description: cleanExcerpt,
        images: featuredImage ? [featuredImage] : [],
      },
    };
  } catch {
    return { title: "Post Not Found" };
  }
}
