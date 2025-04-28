
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type WhatsAppContactProps = {
  sellerId: string;
  productName: string;
}

const WhatsAppContact: React.FC<WhatsAppContactProps> = ({ sellerId, productName }) => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerPhone = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', sellerId)
          .single();

        if (error) {
          console.error('Error fetching seller phone:', error);
          return;
        }

        setPhoneNumber(data?.phone_number);
      } catch (err) {
        console.error('Failed to fetch seller phone:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerPhone();
    }
  }, [sellerId]);

  const handleContactSeller = () => {
    if (!phoneNumber) {
      toast.error("Seller's contact information is not available");
      return;
    }

    // Format number for WhatsApp (remove spaces, dashes, etc.)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Create WhatsApp link with pre-filled message
    const message = `Hello! I'm interested in your "${productName}" on Campus Market.`;
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading contact...
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleContactSeller}
      className="w-full"
      disabled={!phoneNumber}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Contact via WhatsApp
    </Button>
  );
};

export default WhatsAppContact;
