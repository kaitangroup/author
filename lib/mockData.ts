export const mockTutors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Experienced mathematics tutor with 8+ years of teaching experience. Specialized in helping students overcome math anxiety and build confidence.',
    subjects: ['Mathematics', 'Algebra', 'Calculus', 'Statistics'],
    hourlyRate: 45,
    rating: 4.9,
    reviewCount: 127,
    location: 'New York, NY',
    responseTime: '1 hour',
    availability: 'Available today',
    education: 'PhD Mathematics, Columbia University',
    experience: '8+ years',
    languages: ['English', 'Spanish'],
    reviews: [
      {
        id: '1',
        studentName: 'Alex M.',
        rating: 5,
        comment: 'Sarah helped me understand calculus concepts I was struggling with for months!',
        date: '2024-01-15'
      },
      {
        id: '2',
        studentName: 'Emma L.',
        rating: 5,
        comment: 'Excellent teacher, very patient and explains things clearly.',
        date: '2024-01-10'
      }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Software engineer and programming tutor. I help students learn to code and prepare for technical interviews.',
    subjects: ['Programming', 'JavaScript', 'Python', 'Web Development'],
    hourlyRate: 60,
    rating: 4.8,
    reviewCount: 89,
    location: 'San Francisco, CA',
    responseTime: '30 minutes',
    availability: 'Available tomorrow',
    education: 'MS Computer Science, Stanford University',
    experience: '6+ years',
    languages: ['English', 'Mandarin'],
    reviews: [
      {
        id: '3',
        studentName: 'Jake R.',
        rating: 5,
        comment: 'Michael helped me land my dream job! His interview prep was invaluable.',
        date: '2024-01-12'
      }
    ]
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Native Spanish speaker and certified language instructor. Making Spanish fun and accessible for all levels.',
    subjects: ['Spanish', 'Grammar', 'Conversation', 'Literature'],
    hourlyRate: 35,
    rating: 4.9,
    reviewCount: 156,
    location: 'Miami, FL',
    responseTime: '2 hours',
    availability: 'Available now',
    education: 'BA Spanish Literature, University of Miami',
    experience: '5+ years',
    languages: ['Spanish', 'English', 'Portuguese'],
    reviews: [
      {
        id: '4',
        studentName: 'David K.',
        rating: 5,
        comment: 'Emily made learning Spanish enjoyable. I can now have conversations with confidence!',
        date: '2024-01-08'
      }
    ]
  },
  {
    id: '4',
    name: 'Dr. Robert Kim',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Former university professor with expertise in physics and chemistry. Passionate about making complex concepts simple.',
    subjects: ['Physics', 'Chemistry', 'Science', 'AP Physics'],
    hourlyRate: 70,
    rating: 4.7,
    reviewCount: 203,
    location: 'Boston, MA',
    responseTime: '1 hour',
    availability: 'Available this week',
    education: 'PhD Physics, MIT',
    experience: '15+ years',
    languages: ['English', 'Korean'],
    reviews: []
  },
  {
    id: '5',
    name: 'Jessica Williams',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'English literature enthusiast and writing coach. Helping students excel in reading, writing, and critical thinking.',
    subjects: ['English', 'Writing', 'Literature', 'Reading Comprehension'],
    hourlyRate: 40,
    rating: 4.8,
    reviewCount: 74,
    location: 'Chicago, IL',
    responseTime: '45 minutes',
    availability: 'Available today',
    education: 'MA English Literature, Northwestern University',
    experience: '4+ years',
    languages: ['English'],
    reviews: []
  },
  {
    id: '6',
    name: 'Ahmed Hassan',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Biochemistry researcher and tutor specializing in organic chemistry and biology. Patient and thorough teaching style.',
    subjects: ['Chemistry', 'Biology', 'Organic Chemistry', 'Biochemistry'],
    hourlyRate: 55,
    rating: 4.9,
    reviewCount: 112,
    location: 'Los Angeles, CA',
    responseTime: '1.5 hours',
    availability: 'Available tomorrow',
    education: 'PhD Biochemistry, UCLA',
    experience: '7+ years',
    languages: ['English', 'Arabic'],
    reviews: []
  }
];

export const mockBookings = [
  {
    id: '1',
    tutorName: 'Sarah Johnson',
    tutorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    subject: 'Mathematics',
    date: '2024-01-20',
    time: '10:00 AM',
    duration: 60,
    status: 'confirmed',
    amount: 45
  },
  {
    id: '2',
    tutorName: 'Michael Chen',
    tutorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    subject: 'Programming',
    date: '2024-01-22',
    time: '2:00 PM',
    duration: 90,
    status: 'pending',
    amount: 90
  }
];

export const mockMessages = [
  {
    id: '1',
    participant: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    lastMessage: 'Hi! I wanted to follow up on our last session. How are you feeling about the calculus problems we worked on?',
    timestamp: '2024-01-18 14:30',
    unread: true
  },
  {
    id: '2',
    participant: 'Michael Chen',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    lastMessage: 'Great job on the JavaScript project! Ready for our next session tomorrow?',
    timestamp: '2024-01-18 10:15',
    unread: false
  }
];