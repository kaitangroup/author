'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { Book, BookFormData } from '@/lib/types';
import { bookService } from '@/lib/bookService';
import { BookModal } from './BookModal';
import { useRouter } from 'next/navigation';

export function BookTable() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookService.fetchUserBooks();
      setBooks(data);
    } catch (err) {
      setError('Failed to load books. Please check your authentication.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBook(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {

    console.log('Delete book with id:', id);
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await bookService.deleteBook(id);
      setBooks(books.filter(book => book.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete book:', err);
      alert('Failed to delete book');
    }
  };

  const handleSubmit = async (data: BookFormData) => {
    if (modalMode === 'create') {
      const newBook = await bookService.createBook(data);
      setBooks([newBook, ...books]);
     router.refresh();
    } else if (selectedBook) {
      const updatedBook = await bookService.updateBook(selectedBook.id, data);
      setBooks(books.map(book => book.id === selectedBook.id ? updatedBook : book));
    }
  };

  const getInitialData = (): BookFormData | undefined => {
    if (!selectedBook) return undefined;
    return {
      title: selectedBook.title.rendered,
      featured_media: selectedBook.featured_media,
      featured_image: null,
      description: selectedBook.content.rendered.replace(/<[^>]*>/g, ''),
      image: selectedBook.acf?.book_image || '',
      url: selectedBook.book_url || '',
      featured_image_url : selectedBook.featured_image_url || null,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Book</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {books.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No books found</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Book</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cover Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">URL</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.map((book) => (

               
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {book.featured_image_url ? (
                        <img
                          src={book.featured_image_url}
                          alt={book.title.rendered}
                          className="h-16 w-12 object-cover rounded shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{book.title.rendered}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-md truncate">
                        {book.content.rendered.replace(/<[^>]*>/g, '')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {book.book_url ? (
                        <a
                          href={book.book_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <span className="text-sm">View</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No URL</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit book"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                       {/* Replace only the delete button block inside the actions cell with this */}
<button
  onClick={() => handleDelete(book.id)}
  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
    deleteConfirm === book.id
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'text-red-600 hover:bg-red-50'
  }`}
  aria-pressed={deleteConfirm === book.id}
  aria-label={deleteConfirm === book.id ? 'Confirm delete' : 'Delete book'}
>
  {deleteConfirm === book.id ? (
    // visible confirm state
    <span className="flex items-center space-x-2">
      <Trash2 className="h-4 w-4" />
      <span className="text-sm">Confirm</span>
    </span>
  ) : (
    // normal state
    <Trash2 className="h-4 w-4" />

    

  )}
</button>
{/* {deleteConfirm === book.id && (
      <span className="ml-2 text-sm text-red-600">Click again to confirm</span>
    )} */}


                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={getInitialData()}
        mode={modalMode}
      />
    </div>
  );
}
