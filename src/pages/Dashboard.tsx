
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData, Product } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

const Dashboard = () => {
  const { products } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Product filtering
  const allProducts = products.filter(product => 
    product.status === 'Active' && 
    (searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group products by category
  const categories = [...new Set(allProducts.map(product => product.category))];
  
  // Get recent products (last 7 days)
  const recentProducts = allProducts.filter(product => {
    const productDate = new Date(product.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return productDate >= sevenDaysAgo;
  });

  // Filter products based on active tab
  const filteredProducts = activeTab === 'all' 
    ? allProducts
    : activeTab === 'recent' 
      ? recentProducts
      : allProducts.filter(product => product.category === activeTab);

  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-campus-blue to-campus-blue-dark text-white mb-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 px-6 py-12 md:py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!</h1>
            <p className="text-lg mb-6">Find great deals or sell your items to other IIIT RK Valley students.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/create-listing">
                <Button size="lg" className="bg-white text-campus-blue hover:bg-blue-50">
                  <Plus className="mr-2 h-4 w-4" />
                  Sell Something
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and tabs */}
      <div className="space-y-6">
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

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="overflow-x-auto flex w-full justify-start pb-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600">No products found.</p>
                {activeTab !== 'all' && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('all')}
                  >
                    View all products
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
