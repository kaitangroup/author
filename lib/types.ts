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

export interface WPUser  {
  id: number;
  name: string;
  bio: string;
  slug: string;
  location: string;
  roles: string[];
  books: string[];
  description?: string;
  avatar?: string;
  website?: string;
  degree?: string;
  hourly_rate?: number;
  staff_id?: number;
  service_id?: number;
  subjects: string[];
  education?: string;
  experience?: string;
  availability?: string[];
  teaching_experience?: string;
  teaching_style?: string;
  date_of_birth?: string;
  university?: string;
  graduation_year?: string;
  languages?: string;
  tutoring_experience?: string;
  why_tutor?: string;
  references?: string;
  timezone?: string;
  location_city_state?: string;
  average_rating?: string;
  reviews_count?: number;
  reviews: any[] | any;
};

export interface StudentDashboard {
  id: number;
  name: string;
  email : string;
  avatar: string;
  messages: string[];
  bookings: any[] | any;
  totalStudents: number;
  averageRating: GLfloat;
  
};

// Define the Review type locally if it's not exported from '@/lib/types'
export type Review = {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
};
export interface AuthorDashboard {
  monthlyEarnings: any;
  totalEarnings: any;
  id: number;
  name: string;
  email : string;
  avatar: string;
  messages: string[];
  books: string[];
  bookings: any[] | any;
  totalStudents: number;
  averageRating: GLfloat;
  
};



// export interface AuthorDashboard {
//   monthlyEarnings: any;
//   totalEarnings: any;
//   id: number;
//   name: string;
//   email: string;
//   avatar: string;
//   messages: string[];
//   books: string[];
//   bookings: {
//     appointment_id: number;
//     book_title: string;
//     author_id: string;
//     student_name: string;
//     date: string;
//     duration: number;
//     amount: number;
//     status: string;
//   }[];  // <-- FIX: Make bookings an array
//   totalStudents: number;
//   averageRating: GLfloat;
// }


