
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useData, Product } from '@/context/DataContext';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
  className?: string;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useData();
  const isWishlisted = wishlist.includes(product.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className={cn("product-card block relative", className)}>
      <div className="relative overflow-hidden">
        {/* Product image with loading state */}
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gray-200 w-full h-full" />
            </div>
          )}
          <img 
            src={product.images?.[0] || '/placeholder.svg'} 
            alt={product.name}
            className={cn(
              "product-card-image w-full h-full object-cover transition-opacity duration-200",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
              setImageLoaded(true);
            }}
          />
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
            )} 
          />
        </button>

        {/* Status badge */}
        {product.status !== 'Active' && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-900 text-white">
            {product.status}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
          <p className="font-bold text-campus-blue">₹{product.price}</p>
        </div>
        <p className="text-sm text-gray-500 mt-1">{product.category}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            {new Date(product.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100">
            {product.condition}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
