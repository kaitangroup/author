import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

export default function FAQPage() {
  const faqCategories = [
    {
      title: 'Getting Started',
      badge: 'Popular',
      questions: [
        {
          id: '1',
          question: 'How do I create an account?',
          answer: 'You can create an account by clicking the "Sign Up" button and choosing whether you want to register as a student or tutor. Fill out the required information and verify your email to get started.'
        },
        {
          id: '2',
          question: 'How do I find a tutor?',
          answer: 'Use our search feature to find tutors by subject, location, price range, or availability. You can also browse tutor profiles to see their qualifications, ratings, and reviews before making a decision.'
        },
        {
          id: '3',
          question: 'How do I book my first lesson?',
          answer: 'Once you find a tutor you like, click on their profile and then "Book a Lesson". Select your preferred date, time, and subject, then send your booking request. The tutor will confirm or suggest alternative times.'
        }
      ]
    },
    {
      title: 'Bookings & Scheduling',
      questions: [
        {
          id: '4',
          question: 'Can I reschedule or cancel a lesson?',
          answer: 'Yes, you can reschedule or cancel lessons up to 24 hours before the scheduled time without penalty. For cancellations within 24 hours, you may be charged a cancellation fee depending on the tutor\'s policy.'
        },
        {
          id: '5',
          question: 'What happens if my tutor cancels?',
          answer: 'If your tutor needs to cancel, you\'ll receive an immediate notification and full refund. We\'ll also help you find an alternative tutor or reschedule with the same tutor if possible.'
        },
        {
          id: '6',
          question: 'How do I join my online lesson?',
          answer: 'You\'ll receive a lesson link via email and in your dashboard 15 minutes before your scheduled time. Simply click the link to join the virtual classroom.'
        }
      ]
    },
    {
      title: 'Payments & Billing',
      badge: 'Important',
      questions: [
        {
          id: '7',
          question: 'How do I pay for lessons?',
          answer: 'We accept major credit cards, debit cards, and PayPal. Payment is processed securely after each lesson is completed. You can also purchase lesson credits in advance.'
        },
        {
          id: '8',
          question: 'When am I charged for a lesson?',
          answer: 'Payment is automatically processed within 24 hours after your lesson is completed. You\'ll receive a receipt via email confirming the transaction.'
        },
        {
          id: '9',
          question: 'What is your refund policy?',
          answer: 'If you\'re not satisfied with a lesson, contact us within 24 hours and we\'ll investigate. We offer full refunds for legitimate concerns and work to resolve any issues with your learning experience.'
        }
      ]
    },
    {
      title: 'For Tutors',
      questions: [
        {
          id: '10',
          question: 'How do I become a tutor?',
          answer: 'Apply through our tutor registration form, providing details about your qualifications, experience, and subjects you teach. We review all applications and conduct background checks before approval.'
        },
        {
          id: '11',
          question: 'How much can I earn as a tutor?',
          answer: 'Tutors set their own hourly rates typically ranging from $20-$100+ per hour. Your earnings depend on your subjects, experience, ratings, and how many lessons you teach.'
        },
        {
          id: '12',
          question: 'When do I get paid?',
          answer: 'Payments are released to your account 24 hours after each completed lesson. You can withdraw your earnings weekly via direct deposit or PayPal.'
        }
      ]
    },
    {
      title: 'Technical Support',
      questions: [
        {
          id: '13',
          question: 'What technical requirements do I need?',
          answer: 'You need a stable internet connection, a computer or tablet with a camera and microphone, and a modern web browser. No special software installation is required.'
        },
        {
          id: '14',
          question: 'I\'m having trouble with video or audio',
          answer: 'First, check your internet connection and browser permissions for camera/microphone access. If issues persist, try refreshing the page or switching to a different browser. Contact support if problems continue.'
        },
        {
          id: '15',
          question: 'How do I share my screen during a lesson?',
          answer: 'Click the "Share Screen" button in your lesson room. Your browser will ask for permission to share your screen or a specific application. Choose what you want to share and click "Share".'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions about TutorConnect. Can't find what you're looking for? Contact our support team.
          </p>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                  {category.badge && (
                    <Badge variant={category.badge === 'Popular' ? 'default' : 'secondary'}>
                      {category.badge}
                    </Badge>
                  )}
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="text-gray-600 mb-6">
                Our support team is here to help. Get in touch and we'll respond within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </a>
                <a 
                  href="mailto:support@tutorconnect.com"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  Email Us
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}