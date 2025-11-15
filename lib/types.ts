export interface Book {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  acf?: {
    book_image?: string;
    book_url?: string;
  };
  book_url?: string;
  author: number;
  featured_media: number;
  featured_image_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

export interface BookFormData {
  featured_media: number;
  title: string;
  description: string;
  image: string;
  featured_image_url: string | null;
  url: string;
  featured_image: File | null;

}
