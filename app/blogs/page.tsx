import { BlogList } from '@/components/blog/blog-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Posts | Modern Blog Reader',
  description: 'Browse through our latest blog posts and articles',
};

export default function BlogsPage() {
  return <BlogList />;
}