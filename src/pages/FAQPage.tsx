
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const faqCategories = [
    {
      category: "Account & Usage",
      questions: [
        {
          question: "How do I create an account on Campus Market?",
          answer: "To create an account, click on 'Sign Up' on the homepage. Use your college email address (@iiit.in) to register, complete your profile information, and verify your email to get started."
        },
        {
          question: "What items are not allowed to be sold on Campus Market?",
          answer: "Items prohibited on Campus Market include illegal goods, weapons, alcohol/drugs, counterfeit products, adult content, and academic work (essays, assignments). We also discourage selling perishable food items and live animals."
        }
      ]
    },
    {
      category: "Buying & Selling",
      questions: [
        {
          question: "How do I list an item for sale?",
          answer: "To list an item, click on the 'Sell Something' button on the dashboard. Fill out the listing form with a title, description, price, category, and photos. Be honest about the condition and provide as much detail as possible to attract buyers."
        },
        {
          question: "What payment methods are recommended?",
          answer: "We recommend cash for in-person transactions. Mobile payment apps like Google Pay, PhonePe, or Paytm are also popular. Always complete the transaction in person, and be cautious of requests to use wire transfers or payment methods that don't offer protection."
        },
        {
          question: "How should I meet with buyers/sellers?",
          answer: "Always meet in public places on campus such as the student center, library, or cafeteria. Meet during daylight hours when possible, and let a friend know about your meeting plans. Never invite strangers to your dorm room or meet in isolated locations."
        }
      ]
    },
    {
      category: "Safety & Support",
      questions: [
        {
          question: "How do I report a suspicious user or listing?",
          answer: "If you encounter a suspicious listing or user, click the 'Report' button on the listing or user profile. Our moderation team will review your report and take appropriate action. For urgent concerns, contact our support team directly via WhatsApp."
        }
      ]
    }
  ];

  const handleContactClick = () => {
    window.open(`https://wa.me/919014410240`, '_blank');
  };

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery.trim() === '' 
    ? faqCategories 
    : faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
               q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-campus-blue to-campus-blue-dark text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 px-6 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg mb-6">Find answers to common questions about using Campus Market</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search FAQs..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="max-w-3xl mx-auto">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((category, index) => (
            category.questions.length > 0 && (
              <div key={index} className="mb-8">
                <h2 className="text-xl font-heading font-bold mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${category.category}-${faqIndex}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-700">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600 mb-4">No results found for "{searchQuery}"</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>Clear search</Button>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-gray-700">Still have questions? We're here to help!</p>
          <Button onClick={handleContactClick} className="mt-4">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
