'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { BookFormData } from '@/lib/types';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormData) => Promise<void>;
  initialData?: BookFormData;
  mode: 'create' | 'edit';
}

export function BookModal({ isOpen, onClose, onSubmit, initialData, mode }: BookModalProps) {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    description: '',
    featured_media: 0,
    image: '',
    url: '',
    featured_image: null,
    featured_image_url: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
    } else {
      setFormData({ title: '', description: '', image: '', url: '', featured_image: null , featured_media: 0, featured_image_url: null});  
    }

    setSelectedFile(null);
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
  
      // Show preview instantly
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        featured_image_url: previewUrl,
      }));
    }
  };

  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend: BookFormData = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        url: formData.url,
        featured_media: formData.featured_media,
        featured_image_url: formData.featured_image_url || null,
        featured_image: selectedFile || null,
      };

      await onSubmit(formDataToSend);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
      setSelectedFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Add New Book' : 'Edit Book'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter book title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter book description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_featured_image">Featured Image</Label>
              {formData.featured_image_url && (
  <div className="mb-2 relative">
    <img
      src={formData.featured_image_url}
      alt="Preview"
      className="h-24 w-24 object-cover rounded-md border"
    />
    {selectedFile && (
      <p className="text-xs text-gray-500 mt-1">
        New image selected — will replace old one
      </p>
    )}
  </div>
)}

              <div className="flex items-center gap-2">
                <Input
                  id="edit_featured_image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? selectedFile.name : 'Choose New Image'}
                </Button>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book URL
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/book"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Book' : 'Update Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
