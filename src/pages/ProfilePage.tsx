
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import ProductCard from '@/components/products/ProductCard';
import { User, UserCircle, Mail, Phone, Home, Upload, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { products } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    hostelDetails: user?.hostelDetails || '',
    profileImage: user?.profileImage || '',
  });

  // Filter products to show only those by the current user
  const userProducts = products.filter(product => product.sellerId === user?.id);
  const activeProducts = userProducts.filter(product => product.status === 'Active');
  const soldProducts = userProducts.filter(product => product.status === 'Sold');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData({ ...formData, profileImage: e.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    
    try {
      // Validate name
      if (!formData.fullName.trim()) {
        toast.error('Name cannot be empty');
        return;
      }

      updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        hostelDetails: formData.hostelDetails,
        profileImage: formData.profileImage,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-bounce h-8 w-8 bg-campus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-heading font-bold mb-8">My Profile</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Information */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  {formData.profileImage ? (
                    <AvatarImage src={formData.profileImage} alt={formData.fullName} />
                  ) : (
                    <AvatarFallback className="text-xl">
                      {getInitials(formData.fullName || 'User Name')}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                {isEditing && (
                  <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-100 transition"
                  >
                    <Upload className="h-4 w-4" />
                    <input
                      id="profile-image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
              
              <h2 className="font-bold text-xl mb-1">{user.fullName}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>

            <Separator className="my-4" />

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input-animation"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
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
                    value={formData.hostelDetails}
                    onChange={handleChange}
                    className="input-animation"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <UserCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p>{user.fullName}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p>{user.studentId}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p>{user.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hostel Details</p>
                    <p>{user.hostelDetails || 'Not provided'}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="w-full" 
                  variant="outline"
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listings */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>My Listings</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">
                    Active ({activeProducts.length})
                  </TabsTrigger>
                  <TabsTrigger value="sold">
                    Sold ({soldProducts.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  {activeProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You don't have any active listings</p>
                      <Button asChild>
                        <a href="/create-listing">Create a Listing</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sold">
                  {soldProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {soldProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You don't have any sold items yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
