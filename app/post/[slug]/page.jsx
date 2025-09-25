// app/post/[slug]/page.jsx (বা .tsx)
export async function generateStaticParams() {
  const res = await fetch("http://hcms.me/wp-json/wp/v2/posts?per_page=10");
  const posts = await res.json();

  return posts.map(post => ({
    slug: post.slug,
  }));
}

export default async function SinglePostPage({ params }) {
  const { slug } = params;

  const res = await fetch(
    `http://hcms.me/wp-json/wp/v2/posts?slug=${slug}&_embed`
  );

  if (!res.ok) {
    return <p className="text-center mt-10">Failed to load post.</p>;
  }

  const data = await res.json();

  if (!data.length) {
    return <p className="text-center mt-10">Post not found.</p>;
  }

  const post = data[0];
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl = featuredMedia?.source_url || "/placeholder-image.png";

  return (
    <article className="max-w-4xl mx-auto p-6">
      <h1
        className="text-4xl font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      ></h1>

      <img
        src={imageUrl}
        alt={post.title.rendered.replace(/<[^>]+>/g, "")}
        className="w-full h-64 object-cover rounded mb-6"
      />

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      ></div>
    </article>
  );
}
