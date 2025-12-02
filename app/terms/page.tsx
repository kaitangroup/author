import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
              <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

              <div className="prose max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-600 mb-4">
                    By accessing and using AuthorConnect, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                  <p className="text-gray-600 mb-4">
                    AuthorConnect is an online platform that connects students with qualified authors for educational services. We facilitate the booking, scheduling, and payment for authoring sessions but do not directly provide educational services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                  <p className="text-gray-600 mb-4">
                    Users must create accounts to access our services. You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Providing accurate and complete information</li>
                    <li>Maintaining the security of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
                  <p className="text-gray-600 mb-4">
                    Users agree not to use the platform to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Share inappropriate or offensive content</li>
                    <li>Attempt to circumvent platform fees</li>
                    <li>Interfere with the platform's operation</li>
                    <li>Impersonate others or provide false information</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Author Responsibilities</h2>
                  <p className="text-gray-600 mb-4">
                    Authors using our platform agree to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Provide accurate qualifications and experience</li>
                    <li>Maintain professional conduct during all interactions</li>
                    <li>Honor scheduled appointments or provide adequate notice</li>
                    <li>Deliver quality educational services</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Student Responsibilities</h2>
                  <p className="text-gray-600 mb-4">
                    Students using our platform agree to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Attend scheduled sessions or cancel with appropriate notice</li>
                    <li>Make payments promptly as required</li>
                    <li>Treat Authors with respect and professionalism</li>
                    <li>Provide honest feedback and reviews</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Payments and Fees</h2>
                  <p className="text-gray-600 mb-4">
                    Payment terms include:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Students pay for lessons through our secure platform</li>
                    <li>Platform fees are deducted from author payments</li>
                    <li>Cancellation fees may apply per our cancellation policy</li>
                    <li>Refunds are provided according to our refund policy</li>
                    <li>All fees and rates are clearly disclosed</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. Cancellation and Refunds</h2>
                  <p className="text-gray-600 mb-4">
                    Our cancellation policy provides:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Free cancellation up to 24 hours before scheduled lessons</li>
                    <li>Cancellations within 24 hours may incur fees</li>
                    <li>Refunds for author no-shows or technical issues</li>
                    <li>Dispute resolution process for unsatisfactory lessons</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Intellectual Property</h2>
                  <p className="text-gray-600 mb-4">
                    The platform, including all content, features, and functionality, is owned by AuthorConnect and protected by intellectual property laws. Users retain rights to their own content but grant us license to use it as necessary to provide our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">10. Privacy</h2>
                  <p className="text-gray-600 mb-4">
                    Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">11. Disclaimers and Limitations</h2>
                  <p className="text-gray-600 mb-4">
                    AuthorConnect provides the platform "as is" without warranties. We are not responsible for the quality of authoring services, though we strive to maintain high standards through our review process.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">12. Termination</h2>
                  <p className="text-gray-600 mb-4">
                    We reserve the right to suspend or terminate accounts for violations of these terms. Users may also terminate their accounts at any time through their account settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
                  <p className="text-gray-600 mb-4">
                    We may update these terms from time to time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of the updated terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
                  <p className="text-gray-600 mb-4">
                    For questions about these terms, please contact us:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">
                      Email: legal@authorconnect.com<br />
                      Address: 123 Education Ave, New York, NY 10001<br />
                      Phone: +1 (555) 123-4567
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}