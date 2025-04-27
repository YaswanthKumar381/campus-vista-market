
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Users, Shield, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-campus-blue" />
            <span className="font-heading font-bold text-xl text-campus-blue">CampusMarket</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-campus-blue to-campus-blue-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Buy & Sell Within Your Campus Community
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: "0.2s"}}>
              The exclusive marketplace for IIIT RK Valley students. Find textbooks, electronics, furniture, and more!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{animationDelay: "0.4s"}}>
              <Link to="/register">
                <Button size="lg" className="bg-white text-campus-blue hover:bg-blue-50 button-animation">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 button-animation">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Why Use Campus Market?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-campus-blue/10 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-campus-blue" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Easy Buying & Selling</h3>
              <p className="text-gray-600">
                List your unused items in minutes and find exactly what you need at student-friendly prices.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-campus-blue/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-campus-blue" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Exclusive to Students</h3>
              <p className="text-gray-600">
                Only IIIT RK Valley students can access the marketplace, creating a trusted community.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-campus-blue/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-campus-blue" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-gray-600">
                Meet on campus for exchanges and pay with your preferred method. No online payment fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-campus-blue text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="font-heading text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create an account with your college email address</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-campus-blue text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="font-heading text-xl font-semibold mb-2">Browse or List</h3>
              <p className="text-gray-600">Find what you need or list items you want to sell</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-campus-blue text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="font-heading text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">Message other students about listings</p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-campus-blue text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">4</div>
              <h3 className="font-heading text-xl font-semibold mb-2">Exchange</h3>
              <p className="text-gray-600">Meet on campus to complete the transaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-campus-blue text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl font-bold mb-6">Ready to Join Campus Market?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-blue-100">
            Start buying and selling with your fellow students today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-campus-blue hover:bg-blue-50 button-animation">
                Create Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 button-animation">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ShoppingCart className="h-6 w-6 text-white" />
              <span className="font-heading font-bold text-xl text-white">CampusMarket</span>
            </div>
            <div className="text-sm">
              © {new Date().getFullYear()} Campus Market. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
