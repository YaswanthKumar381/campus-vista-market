
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData, Product } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BadgeCheck, Heart, MessageSquare, Trash2, ArrowLeft, Edit, MapPin, CalendarDays, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, wishlist, addToWishlist, removeFromWishlist, sendMessage, deleteProduct } = useData();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('Hi, is this still available?');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sellerPhoneNumber, setSellerPhoneNumber] = useState<string | null>(null);
  const isWishlisted = productId ? wishlist.includes(productId) : false;

  // Find the product and determine if current user is the owner
  useEffect(() => {
    if (productId) {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        setIsOwner(foundProduct.sellerId === user?.id);
        
        // Find related products (same category, excluding current product)
        const related = products.filter(p => 
          p.id !== productId && 
          p.category === foundProduct.category &&
          p.status === 'Active'
        ).slice(0, 4);
        setRelatedProducts(related);
        
        // Fetch seller phone number
        fetchSellerPhoneNumber(foundProduct.sellerId);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    }
  }, [productId, products, user, navigate]);

  const fetchSellerPhoneNumber = async (sellerId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', sellerId)
        .single();
      
      if (error) {
        console.error('Error fetching seller phone number:', error);
        return;
      }
      
      setSellerPhoneNumber(data?.phone_number || null);
    } catch (error) {
      console.error('Error fetching seller details:', error);
    }
  };

  const handleWishlistToggle = () => {
    if (!productId) return;
    
    if (isWishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const handleSendMessage = () => {
    if (!product || !user) return;
    
    sendMessage(product.sellerId, message, product.id);
    toast.success('Message sent to seller!');
    navigate(`/chat/${product.sellerId}`);
  };

  const handleDeleteProduct = () => {
    if (!productId) return;
    
    deleteProduct(productId);
    toast.success('Product deleted successfully');
    navigate('/dashboard');
  };

  const handleContactSeller = () => {
    if (sellerPhoneNumber) {
      const whatsappUrl = `https://wa.me/${sellerPhoneNumber.replace(/\D/g, '')}?text=Hi, I'm interested in your product: ${product?.name}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast.error('Seller has not provided a phone number');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-bounce h-8 w-8 bg-campus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Product Images */}
        <div className="md:col-span-3 space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
            {product.images.length > 0 ? (
              <>
                <img 
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  className="object-contain h-full w-full"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                {product.status !== 'Active' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-4 py-2 rounded-full font-medium">
                      {product.status}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded border-2",
                    activeImageIndex === index 
                      ? "border-campus-blue" 
                      : "border-transparent"
                  )}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Product Description */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-heading font-bold">{product.name}</h1>
              {!isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={handleWishlistToggle}
                >
                  <Heart 
                    className={cn(
                      "h-6 w-6",
                      isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                    )}
                  />
                </Button>
              )}
            </div>
            
            <div className="mt-2 flex items-center">
              <span className="text-3xl font-bold text-campus-blue">₹{product.price}</span>
              {product.negotiable && (
                <span className="ml-2 text-sm bg-campus-blue-light/10 text-campus-blue-light px-2 py-0.5 rounded">
                  Negotiable
                </span>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="bg-gray-100 px-2 py-1 rounded flex items-center">
                <span className="mr-1">Condition:</span>
                <span className="font-semibold">{product.condition}</span>
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded flex items-center">
                <span className="mr-1">Category:</span>
                <span className="font-semibold">{product.category}</span>
              </span>
            </div>
            
            <div className="mt-4 flex flex-col space-y-2 text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{product.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span>Listed on {formatDate(product.createdAt)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  {product.sellerImage ? (
                    <AvatarImage src={product.sellerImage} alt={product.sellerName} />
                  ) : (
                    <AvatarFallback>
                      {product.sellerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{product.sellerName}</div>
                  <div className="text-sm text-gray-500">Seller</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {isOwner ? (
            <div className="flex flex-col space-y-3">
              <Link to={`/create-listing?edit=${product.id}`}>
                <Button className="w-full flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Listing
                </Button>
              </Link>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Listing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this listing?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. The listing will be permanently removed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" className="mr-2">Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {product.status === 'Active' && (
                <Button 
                  variant="outline" 
                  onClick={() => toast.success("Coming soon - Mark as sold feature")}
                >
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Mark as Sold
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <Card>
                <CardContent className="pt-6 pb-4">
                  <CardTitle className="text-base mb-2">Interested in this item?</CardTitle>
                  <CardDescription className="mb-4">
                    Send a message to the seller to express your interest or ask questions.
                  </CardDescription>
                  <Textarea
                    placeholder="Write your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mb-4"
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleSendMessage}
                    disabled={message.trim() === ''}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact via Chat
                  </Button>
                </CardFooter>
              </Card>
              
              {sellerPhoneNumber && (
                <Button 
                  variant="outline"
                  className="w-full" 
                  onClick={handleContactSeller}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Contact via WhatsApp
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-heading font-bold mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
