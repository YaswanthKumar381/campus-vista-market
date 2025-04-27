
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    phoneNumber: '',
    hostelDetails: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.email) {
      toast.error('Please enter your email');
      return false;
    }
    if (!formData.email.endsWith('@rguktrkv.ac.in')) {
      toast.error('Please use your RGUKT RK Valley email address');
      return false;
    }
    if (!formData.studentId) {
      toast.error('Please enter your student ID');
      return false;
    }
    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    const success = await register({
      full_name: formData.fullName,
      email: formData.email,
      student_id: formData.studentId,
      phone_number: formData.phoneNumber,
      hostel_details: formData.hostelDetails,
      password: formData.password
    });
    setIsLoading(false);
    
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
      {/* Logo & title */}
      <div className="flex flex-col items-center mb-8">
        <Link to="/" className="flex items-center mb-6">
          <ShoppingCart className="h-8 w-8 text-campus-blue mr-2" />
          <span className="font-heading font-bold text-2xl text-campus-blue">CampusMarket</span>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg animate-scale-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Register with your RGUKT RK Valley email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="input-animation"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email" 
              placeholder="student@rguktrkv.ac.in"
              value={formData.email}
              onChange={handleChange}
              className="input-animation"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Must be an RGUKT RK Valley email address
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              name="studentId"
              placeholder="Student ID"
              value={formData.studentId}
              onChange={handleChange}
              className="input-animation"
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="input-animation"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostelDetails">Hostel Details (Optional)</Label>
              <Input
                id="hostelDetails"
                name="hostelDetails"
                placeholder="Hostel & Room Number"
                value={formData.hostelDetails}
                onChange={handleChange}
                className="input-animation"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              className="input-animation"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-animation"
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full button-animation" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : 'Register'}
          </Button>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-campus-blue font-medium hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
