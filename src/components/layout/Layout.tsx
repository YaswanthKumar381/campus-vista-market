
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce h-8 w-8 bg-campus-blue rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DataProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-6 animate-fade-in">
          <Outlet />
        </main>
        <Footer />
      </div>
    </DataProvider>
  );
};

export default Layout;
