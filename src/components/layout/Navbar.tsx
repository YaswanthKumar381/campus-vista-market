
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SheetTrigger, Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Menu, User, LogOut, ShoppingCart, Heart, MessageSquare, Plus, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-campus-blue" />
          <span className="font-heading font-bold text-xl text-campus-blue">CampusMarket</span>
        </Link>

        {/* Search bar - hide on mobile */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8 pr-4 py-2 focus-visible:ring-campus-blue-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link 
            to="/create-listing" 
            className="flex items-center space-x-1 bg-campus-green-light hover:bg-campus-green text-white px-4 py-2 rounded-md transition-colors button-animation"
          >
            <Plus className="h-4 w-4" />
            <span>Sell</span>
          </Link>
          
          <Link to="/wishlist" className="text-gray-600 hover:text-campus-blue transition-colors">
            <Heart className="h-5 w-5" />
          </Link>
          
          <Link to="/chat" className="text-gray-600 hover:text-campus-blue transition-colors">
            <MessageSquare className="h-5 w-5" />
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {user?.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.fullName} />
                  ) : (
                    <AvatarFallback>{getInitials(user?.fullName || 'User')}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer text-red-500 hover:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile navigation */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 pt-4">
                <div className="flex items-center space-x-2">
                  {user?.profileImage ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                    </Avatar>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(user?.fullName || 'User')}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.fullName}</span>
                    <span className="text-sm text-gray-500">{user?.email}</span>
                  </div>
                </div>
                
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-full pl-8 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                
                <Link 
                  to="/create-listing" 
                  className="flex items-center justify-center space-x-1 bg-campus-green-light hover:bg-campus-green text-white px-4 py-2 rounded-md transition-colors button-animation"
                >
                  <Plus className="h-4 w-4" />
                  <span>Sell Something</span>
                </Link>
                
                <div className="border-t pt-4">
                  <Link to="/dashboard" className="flex items-center py-2 text-gray-600 hover:text-campus-blue">
                    <Home className="mr-2 h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  <Link to="/wishlist" className="flex items-center py-2 text-gray-600 hover:text-campus-blue">
                    <Heart className="mr-2 h-5 w-5" />
                    <span>Wishlist</span>
                  </Link>
                  <Link to="/chat" className="flex items-center py-2 text-gray-600 hover:text-campus-blue">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    <span>Messages</span>
                  </Link>
                  <Link to="/profile" className="flex items-center py-2 text-gray-600 hover:text-campus-blue">
                    <User className="mr-2 h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </div>
                
                <div className="border-t pt-4">
                  <Button 
                    onClick={handleLogout} 
                    variant="destructive" 
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
