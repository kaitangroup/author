import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

type BookObject = {
  id: number;
  title: string;
  book_url: string;
};

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: string;
  responseTime: string;
  availability: string;
 
  books?: BookObject[] | string[] | string;
}

interface TutorCardProps {
  tutor: Tutor;
}

export function TutorCard({ tutor }: TutorCardProps) {
  const router = useRouter();

  
  const rawBooks = tutor.books;

  const normalizedBooks: { title: string; url?: string }[] = (() => {
    if (!rawBooks) return [];

    // array হলে
    if (Array.isArray(rawBooks)) {
      // object array: {id,title,book_url}
      if (rawBooks.length > 0 && typeof rawBooks[0] === 'object') {
        return (rawBooks as BookObject[]).map((b) => ({
          title: b.title,
          url: b.book_url || undefined,
        }));
      }
      // string array: ['Book 1', 'Book 2']
      return (rawBooks as string[]).map((t) => ({ title: t }));
    }

   
    if (typeof rawBooks === 'string') {
      return rawBooks
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((title) => ({ title }));
    }

    return [];
  })();

  const hasBooks = normalizedBooks.length > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={tutor.avatar} alt={tutor.name} />
            <AvatarFallback>
              {tutor.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{tutor.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{tutor.rating}</span>
              <span className="text-sm text-gray-500">
                ({tutor.reviewCount} reviews)
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{tutor.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{tutor.responseTime} hours tutoring</span>
              </div>
            </div>
          </div>
        </div>

       
        {hasBooks ? (
          <div className="mb-4">
            <p className="text-gray-700 text-sm font-semibold mb-2">
              Books
            </p>
            <div className="flex flex-wrap gap-2">
              {normalizedBooks.slice(0, 3).map((book, idx) =>
                book.url ? (
                  <Link
                    key={idx}
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs cursor-pointer"
                    >
                      {book.title}
                    </Badge>
                  </Link>
                ) : (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {book.title}
                  </Badge>
                )
              )}

              {normalizedBooks.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{normalizedBooks.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {tutor.bio}
          </p>
        )}
        <div className="mb-4">
          <p className="text-gray-700 text-sm font-semibold mb-2">
                Subjects
              </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {tutor.subjects.slice(0, 3).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
            {tutor.subjects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tutor.subjects.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">
            ${tutor.hourlyRate}/hr
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/messages?to=${tutor.id}`)}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Message
            </Button>

            <Link href={`/tutors/${tutor.id}`}>
              <Button
                size="sm"
                className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
              >
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
