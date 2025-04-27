
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData, Product } from '@/context/DataContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';

const ProductsPage = () => {
  const location = useLocation();
  const { products } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [sortOption, setSortOption] = useState<string>('newest');

  // Extract search param from URL if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Get all categories from products
  const categories = [...new Set(products.map(product => product.category))];
  
  // Get all conditions
  const conditions = [...new Set(products.map(product => product.condition))];
  
  // Filter products based on criteria
  const filteredProducts = products
    .filter(product => 
      // Active products only
      product.status === 'Active' &&
      // Search text
      (searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      // Category filter
      (selectedCategory === '' || product.category === selectedCategory) &&
      // Condition filter
      (selectedCondition === '' || product.condition === selectedCondition) &&
      // Price range filter
      product.price >= priceRange[0] && product.price <= priceRange[1] &&
      // Negotiable filter
      (!negotiableOnly || product.negotiable)
    );
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCondition('');
    setPriceRange([0, 50000]);
    setNegotiableOnly(false);
  };

  const filtersApplied = 
    searchQuery !== '' || 
    selectedCategory !== '' || 
    selectedCondition !== '' || 
    negotiableOnly || 
    priceRange[0] > 0 || 
    priceRange[1] < 50000;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">Browse Products</h1>
        
        {/* Mobile filters button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow down products with these filters
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-6">
              {/* Category filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition filter */}
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Condition</SelectItem>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range filter */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Price Range (₹)</Label>
                  <span className="text-sm">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 50000]}
                  value={priceRange}
                  min={0}
                  max={50000}
                  step={100}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="py-4"
                />
                <div className="flex justify-between">
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => 
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-[45%]"
                  />
                  <span className="text-center">-</span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => 
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-[45%]"
                  />
                </div>
              </div>

              {/* Negotiable filter */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="negotiable-mobile" 
                  checked={negotiableOnly}
                  onCheckedChange={() => setNegotiableOnly(!negotiableOnly)}
                />
                <Label htmlFor="negotiable-mobile">Negotiable only</Label>
              </div>

              <div className="pt-4 space-x-2">
                <SheetClose asChild>
                  <Button className="w-full">Apply Filters</Button>
                </SheetClose>
                {filtersApplied && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters} 
                    className="w-full mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort dropdown */}
        <div className="hidden md:block">
          <Select
            value={sortOption}
            onValueChange={setSortOption}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search and sort (mobile) */}
      <div className="flex flex-col md:hidden space-y-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={sortOption}
          onValueChange={setSortOption}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop filters */}
        <div className="hidden md:block w-64 space-y-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filters</h3>
              {filtersApplied && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            {/* Search */}
            <div className="space-y-2 mb-4">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="space-y-2 mb-4">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition filter */}
            <div className="space-y-2 mb-4">
              <Label>Condition</Label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Condition</SelectItem>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range filter */}
            <div className="space-y-4 mb-4">
              <div className="flex justify-between">
                <Label>Price Range (₹)</Label>
                <span className="text-sm">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </span>
              </div>
              <Slider
                defaultValue={[0, 50000]}
                value={priceRange}
                min={0}
                max={50000}
                step={100}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="py-4"
              />
              <div className="flex justify-between">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => 
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  className="w-[45%]"
                />
                <span className="text-center">-</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => 
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="w-[45%]"
                />
              </div>
            </div>

            {/* Negotiable filter */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="negotiable" 
                checked={negotiableOnly}
                onCheckedChange={() => setNegotiableOnly(!negotiableOnly)}
              />
              <Label htmlFor="negotiable">Negotiable only</Label>
            </div>
          </div>
        </div>

        {/* Product listing */}
        <div className="flex-1">
          {/* Active filters display */}
          {filtersApplied && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Active filters:</span>
              
              {searchQuery && (
                <div className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
                  <span>Search: {searchQuery}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchQuery('')}
                    className="h-5 w-5 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {selectedCategory && (
                <div className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
                  <span>Category: {selectedCategory}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedCategory('')}
                    className="h-5 w-5 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {selectedCondition && (
                <div className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
                  <span>Condition: {selectedCondition}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedCondition('')}
                    className="h-5 w-5 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                <div className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
                  <span>Price: ₹{priceRange[0]} - ₹{priceRange[1]}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPriceRange([0, 50000])}
                    className="h-5 w-5 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {negotiableOnly && (
                <div className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
                  <span>Negotiable only</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setNegotiableOnly(false)}
                    className="h-5 w-5 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="font-medium text-lg mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
