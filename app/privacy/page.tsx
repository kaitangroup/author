import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
              <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

              <div className="prose max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                  <p className="text-gray-600 mb-4">
                    We collect information you provide directly to us, such as when you create an account, book a lesson, or contact us for support.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Personal information (name, email address, phone number)</li>
                    <li>Profile information (education, subjects, experience)</li>
                    <li>Payment information (processed securely by our payment providers)</li>
                    <li>Communications between users on our platform</li>
                    <li>Usage data and analytics</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                  <p className="text-gray-600 mb-4">
                    We use the information we collect to provide, maintain, and improve our services:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>To create and maintain your account</li>
                    <li>To facilitate lesson bookings and communications</li>
                    <li>To process payments and prevent fraud</li>
                    <li>To send you notifications and updates</li>
                    <li>To improve our platform and user experience</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
                  <p className="text-gray-600 mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>With authors and students to facilitate lessons</li>
                    <li>With payment processors to handle transactions</li>
                    <li>With service providers who assist in operating our platform</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or acquisition</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                  <p className="text-gray-600 mb-4">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Your Rights and Choices</h2>
                  <p className="text-gray-600 mb-4">
                    You have certain rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Access and update your account information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request a copy of your personal data</li>
                    <li>Lodge a complaint with a supervisory authority</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
                  <p className="text-gray-600 mb-4">
                    We use cookies and similar tracking technologies to improve your experience on our platform. You can control cookie settings through your browser preferences.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
                  <p className="text-gray-600 mb-4">
                    Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
                  <p className="text-gray-600 mb-4">
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
                  <p className="text-gray-600 mb-4">
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about this privacy policy or our practices, please contact us:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">
                      Email: privacy@authorconnect.com<br />
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