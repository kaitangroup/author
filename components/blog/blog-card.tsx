'use client';

import Link from 'next/link';
import { BlogPost } from '@/lib/wordpress';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  };

  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const author = post._embedded?.author?.[0];

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-0">
        {featuredImage && (
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={featuredImage}
              alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.date)}</span>
          </div>
          {author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{author.name}</span>
            </div>
          )}
        </div>

        <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title.rendered}
        </h3>

        <p className="text-muted-foreground leading-relaxed mb-4">
          {stripHtml(post.excerpt.rendered)}
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/blogs/${post.slug}`} className="w-full">
          <Button className="w-full group/btn" variant="outline">
            Read More
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}