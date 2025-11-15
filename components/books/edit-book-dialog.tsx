import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { updateBook } from '@/lib/wordpress-api';
import type { Book, BookFormData } from '@/types/book';

interface EditBookDialogProps {
  book: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditBookDialog({ book, open, onOpenChange, onSuccess }: EditBookDialogProps) {
  const [formData, setFormData] = useState<BookFormData>({
    book_title: book.book_title,
    book_author: book.book_author,
    book_url: book.book_url,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      book_title: book.book_title,
      book_author: book.book_author,
      book_url: book.book_url,
    });
  }, [book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.book_title.trim() || !formData.book_author.trim()) {
      setError('Title and author are required');
      return;
    }

    try {
      setLoading(true);
      await updateBook(book.id, formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update the book details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit_book_title">Book Title *</Label>
            <Input
              id="edit_book_title"
              value={formData.book_title}
              onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
              placeholder="Enter book title"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_book_author">Author *</Label>
            <Input
              id="edit_book_author"
              value={formData.book_author}
              onChange={(e) => setFormData({ ...formData, book_author: e.target.value })}
              placeholder="Enter author name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_book_url">Book URL</Label>
            <Input
              id="edit_book_url"
              type="url"
              value={formData.book_url}
              onChange={(e) => setFormData({ ...formData, book_url: e.target.value })}
              placeholder="https://example.com/book"
              disabled={loading}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
