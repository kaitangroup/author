import { Book, BookFormData } from './types';

const WP_API_BASE = 'http://authorproback.me/wp-json/wp/v2';

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('wpToken');
  if (!token) return {};
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const getAuthHeaders2 = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('wpToken');
  if (!token) return {};
  return {
    
    'Authorization': `Bearer ${token}`,
  };
};

export const bookService = {
  async fetchUserBooks(): Promise<Book[]> {
    try {
      const userId = await this.getCurrentUserId();
      const res = await fetch(`${WP_API_BASE}/book?author=${userId}&_embed`, {
        headers: getAuthHeaders(),
        next: { revalidate: 60 },
      });
      if (!res.ok) throw new Error(`Failed to fetch books: ${res.statusText}`);
      const data = await res.json();
      return data.map((book: any) => ({
        ...book,
        featured_image_url: book._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  },

  async getCurrentUserId(): Promise<number> {
    const response = await fetch(`${WP_API_BASE}/users/me`, {
      headers: getAuthHeaders(),
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error('Failed to get user info');
    const user = await response.json();
    return user.id;
  },

  async createBook(data: BookFormData): Promise<Book> {
        // upload featured image

       
        let featuredMediaId: number | undefined;
        let mediaSource = '';
        let bookdata: any = {};
        if (data.featured_image) {
          const mediaFormData = new FormData();
          mediaFormData.append('file', data.featured_image);
    
          const mediaResponse = await fetch(`${WP_API_BASE}/media`, {
            method: 'POST',
            headers: getAuthHeaders2(),
            body: mediaFormData,
          });
    
          if (mediaResponse.ok) {
            const media = await mediaResponse.json();
            featuredMediaId = media.id;
            mediaSource = media.source_url;
            
          }
        }

        if (featuredMediaId) data.featured_media = featuredMediaId;
    const response = await fetch(`${WP_API_BASE}/book`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: data.title,
        featured_media: data.featured_media,
        content: data.description,
        status: 'publish',
        book_url: data.url,
      }),
    });
    if (!response.ok) throw new Error('Failed to create book');
    bookdata = response.json();
    const book = await bookdata;
    return {
      id: book.id,
      title: book.title,
      content: book.content,
      author: book.author,
      book_url: book.book_url,
      featured_media: book.featured_media,
      featured_image_url: mediaSource,
    };
  },

  async updateBook(id: number, data: BookFormData): Promise<Book> {

    
    let featuredMediaId: number | undefined;
    let mediaSource = '';
        let bookdata: any = {};
    if (data.featured_image) {
      const mediaFormData = new FormData();
      mediaFormData.append('file', data.featured_image);

      const mediaResponse = await fetch(`${WP_API_BASE}/media`, {
        method: 'POST',
        headers: getAuthHeaders2(),
        body: mediaFormData,
      });

      if (mediaResponse.ok) {
        const media = await mediaResponse.json();
        featuredMediaId = media.id;
        mediaSource = media.source_url;
      }
    }

    if (featuredMediaId){
      data.featured_media = featuredMediaId;
    }else{
      mediaSource = data.featured_image_url || '';
    }
    const response = await fetch(`${WP_API_BASE}/book/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: data.title,
        content: data.description,
        featured_media: data.featured_media,
        book_url: data.url,
    
      }),
    });
    if (!response.ok) throw new Error('Failed to update book');
    bookdata = response.json();
    const book = await bookdata;

    
    return {
      id: book.id,
      title: book.title,
      content: book.content,
      author: book.author,
      featured_media: book.featured_media,
      book_url: book.book_url,
      featured_image_url: mediaSource,
    };
  },

  async deleteBook(id: number): Promise<void> {
    const response = await fetch(`${WP_API_BASE}/book/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete book');
  },
};
