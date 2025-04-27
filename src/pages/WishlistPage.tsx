
import React from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/products/ProductCard';
import { ShoppingBag } from 'lucide-react';

const WishlistPage = () => {
  const { products, wishlist } = useData();
  
  // Get all products in the wishlist
  const wishlistedProducts = products.filter(product => wishlist.includes(product.id));

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-heading font-bold mb-8">My Wishlist</h1>
      
      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6 text-center">
            Save items you're interested in by clicking the heart icon on product pages.
          </p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
