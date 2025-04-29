
import React, { useState, useEffect } from 'react';
import { useData, Product } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/products/ProductCard';
import { ShoppingBag, RefreshCcw, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const WishlistPage = () => {
  const { fetchWishlistedProducts, wishlistLoading } = useData();
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Load wishlisted products when the page loads
  useEffect(() => {
    loadWishlist();
  }, []);
  
  // Function to load the wishlist
  const loadWishlist = async () => {
    try {
      setLoading(true);
      const products = await fetchWishlistedProducts();
      setWishlistedProducts(products);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh wishlist data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadWishlist();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Skeleton loader for wishlist items
  const WishlistSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold">My Wishlist</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={loading || isRefreshing}
          title="Refresh wishlist"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {loading || wishlistLoading ? (
        <WishlistSkeleton />
      ) : wishlistedProducts.length > 0 ? (
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
