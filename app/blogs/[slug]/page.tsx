import { wordpressAPI } from '@/lib/wordpress';
import { BlogDetailView } from '@/components/blog/blog-detail-view';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await wordpressAPI.getPost(params.slug);
    
    if (!post) {
      return {
        title: 'Post Not Found',
      };
    }

    return {
      title: `${post.title.rendered} | Modern Blog Reader`,
      description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  try {
    const post = await wordpressAPI.getPost(params.slug);

    if (!post) {
      notFound();
    }

    return <BlogDetailView post={post} />;
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}