import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, ExternalLink, User } from 'lucide-react';
import type { Book } from '@/types/book';

interface BooksListProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (id: number) => void;
}

export function BooksList({ books, onEdit, onDelete }: BooksListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <Card
          key={book.id}
          className="hover:shadow-xl transition-all duration-300 border-slate-200 bg-white overflow-hidden group"
        >
          <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-slate-700 transition-colors">
              {book.book_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">{book.book_author}</span>
            </div>
            {book.book_url && (
              <a
                href={book.book_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Book URL
              </a>
            )}
            {book.date && (
              <Badge variant="secondary" className="text-xs">
                Added {new Date(book.date).toLocaleDateString()}
              </Badge>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 flex gap-2 pt-4">
            <Button
              onClick={() => onEdit(book)}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={() => onDelete(book.id)}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
