
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, HelpCircle, LifeBuoy, Phone, Mail, Users } from 'lucide-react';

const HelpCenterPage = () => {
  const handleContactClick = () => {
    window.open(`https://wa.me/919014410240`, '_blank');
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-campus-blue to-campus-blue-dark text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 px-6 py-12 md:py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-lg mb-6">Get support for Campus Market services and features</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-campus-blue" />
              FAQs
            </CardTitle>
            <CardDescription>Find answers to commonly asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Browse our comprehensive FAQ section for instant answers to your questions about buying, selling, and more.
            </p>
            <Button asChild>
              <a href="/faq">View FAQs</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-campus-blue" />
              Contact Support
            </CardTitle>
            <CardDescription>Reach out to our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Need personalized help? Our support team is available to assist you with any issues or questions.
            </p>
            <Button onClick={handleContactClick}>
              Contact Us
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LifeBuoy className="h-5 w-5 mr-2 text-campus-blue" />
              Guides
            </CardTitle>
            <CardDescription>Step-by-step tutorials and guides</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Learn how to make the most of Campus Market with our detailed guides and tutorials.
            </p>
            <Button variant="outline">View Guides</Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-heading font-bold mb-4">Contact Information</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <Phone className="h-5 w-5 mr-3 text-campus-blue mt-0.5" />
            <div>
              <p className="font-medium">WhatsApp Support</p>
              <p className="text-gray-600">+91 9014410240</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-campus-blue" 
                onClick={handleContactClick}
              >
                Open WhatsApp
              </Button>
            </div>
          </div>

          <div className="flex items-start">
            <Mail className="h-5 w-5 mr-3 text-campus-blue mt-0.5" />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-gray-600">support@campusmarket.com</p>
            </div>
          </div>

          <div className="flex items-start">
            <Users className="h-5 w-5 mr-3 text-campus-blue mt-0.5" />
            <div>
              <p className="font-medium">Campus Ambassadors</p>
              <p className="text-gray-600">Find us at the Student Union building on Tuesdays and Thursdays from 10 AM - 2 PM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
