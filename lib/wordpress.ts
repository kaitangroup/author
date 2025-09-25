export interface BlogPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  slug: string;
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      name: string;
      avatar_urls: {
        '96': string;
      };
    }>;
  };
  author: number;
  categories: number[];
}

export interface WordPressConfig {
  baseUrl: string;
  postsPerPage?: number;
}

// Default configuration - replace with your WordPress site URL
const defaultConfig: WordPressConfig = {
  baseUrl: 'http://authorproback.me/',
  postsPerPage: 12
};

export class WordPressAPI {
  private config: WordPressConfig;

  constructor(config?: Partial<WordPressConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  async getPosts(page: number = 1, search?: string): Promise<{ posts: BlogPost[], total: number }> {
    try {
      const params = new URLSearchParams({
        per_page: this.config.postsPerPage?.toString() || '12',
        page: page.toString(),
        _embed: 'true'
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${this.config.baseUrl}wp-json/wp/v2/posts?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle WordPress.com API response format
      if (data.posts) {
        return {
          posts: data.posts,
          total: data.found || data.posts.length
        };
      }

      // Handle standard WordPress REST API response
      return {
        posts: data,
        total: parseInt(response.headers.get('X-WP-Total') || '0')
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}wp-json/wp/v2/posts?slug=${slug}&_embed=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle WordPress.com API response format
      if (data.posts && data.posts.length > 0) {
        return data.posts[0];
      }
      
      // Handle standard WordPress REST API response
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }
}

export const wordpressAPI = new WordPressAPI();