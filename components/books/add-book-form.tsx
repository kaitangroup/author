import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { createBook } from '@/lib/wordpress-api';
import type { BookFormData } from '@/types/book';

interface AddBookFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddBookForm({ onSuccess, onCancel }: AddBookFormProps) {
  const [formData, setFormData] = useState<BookFormData>({
    book_title: '',
    book_author: '',
    book_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.book_title.trim() || !formData.book_author.trim()) {
      setError('Title and author are required');
      return;
    }

    try {
      setLoading(true);
      await createBook(formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="book_title">Book Title *</Label>
        <Input
          id="book_title"
          value={formData.book_title}
          onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
          placeholder="Enter book title"
          disabled={loading}
          className="border-slate-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="book_author">Author *</Label>
        <Input
          id="book_author"
          value={formData.book_author}
          onChange={(e) => setFormData({ ...formData, book_author: e.target.value })}
          placeholder="Enter author name"
          disabled={loading}
          className="border-slate-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="book_url">Book URL</Label>
        <Input
          id="book_url"
          type="url"
          value={formData.book_url}
          onChange={(e) => setFormData({ ...formData, book_url: e.target.value })}
          placeholder="https://example.com/book"
          disabled={loading}
          className="border-slate-300"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-slate-900 hover:bg-slate-800"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Add Book
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
