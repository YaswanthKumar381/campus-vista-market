import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData, Product } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Loader2, Upload, Image as ImageIcon, MapPin } from 'lucide-react';

const categories = [
  "Books",
  "Electronics",
  "Clothing",
  "Home & Decor",
  "Sports & Fitness",
  "Stationery",
  "Cosmetics",
  "Furniture",
  "Other",
];

const conditions = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
];

const CreateListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createProduct, products, updateProduct } = useData();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    negotiable: false,
    images: [] as string[],
  });

  // Check if we're in edit mode by looking for a product ID in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editProductId = params.get('edit');
    
    if (editProductId) {
      const productToEdit = products.find(p => p.id === editProductId);
      if (productToEdit && productToEdit.sellerId === user?.id) {
        setIsEditMode(true);
        setProductToEdit(productToEdit);
        
        // Populate form data
        setFormData({
          name: productToEdit.name,
          description: productToEdit.description,
          price: productToEdit.price.toString(),
          category: productToEdit.category,
          condition: productToEdit.condition,
          location: productToEdit.location,
          negotiable: productToEdit.negotiable,
          images: [...productToEdit.images],
        });
      } else {
        // Product not found or not owned by current user
        toast.error("You can only edit your own listings");
        navigate('/dashboard');
      }
    }
  }, [location.search, products, user?.id, navigate]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({ ...formData, price: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, negotiable: checked });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check if we've hit the limit of 5 images
    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    // For each file, create a data URL
    Array.from(files).forEach(file => {
      // Quick validation
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, e.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a product name');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a product description');
      return false;
    }
    if (!formData.price.trim()) {
      toast.error('Please enter a price');
      return false;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }
    if (!formData.condition) {
      toast.error('Please select a condition');
      return false;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter a pickup location');
      return false;
    }
    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isEditMode && productToEdit) {
        // Update existing product
        updateProduct(productToEdit.id, {
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category as any,
          condition: formData.condition as any,
          location: formData.location,
          negotiable: formData.negotiable,
          images: formData.images,
        });
        toast.success('Product updated successfully!');
        navigate(`/products/${productToEdit.id}`);
      } else {
        // Create new product
        const productData = {
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category as any,
          condition: formData.condition as any,
          location: formData.location,
          negotiable: formData.negotiable,
          images: formData.images,
          sellerId: user!.id,
          sellerName: user!.fullName,
          sellerImage: user!.profileImage,
        };
        
        const productId = await createProduct(productData);
        toast.success('Product listed successfully!');
        navigate(`/products/${productId}`);
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
      toast.error('There was an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-heading font-bold mb-8">
        {isEditMode ? 'Edit Your Listing' : 'Create a New Listing'}
      </h1>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleTextChange}
                  className="input-animation"
                  disabled={isLoading}
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your product in detail"
                  value={formData.description}
                  onChange={handleTextChange}
                  className="min-h-[150px] input-animation"
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handlePriceChange}
                    className="input-animation"
                    disabled={isLoading}
                    type="text"
                    inputMode="numeric"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Pickup Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Boys Hostel Block A"
                    value={formData.location}
                    onChange={handleTextChange}
                    className="input-animation"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => handleSelectChange('condition', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="negotiable"
                  checked={formData.negotiable}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Label htmlFor="negotiable">Price is negotiable</Label>
              </div>
            </CardContent>
          </Card>
          
          {/* Images */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Product Images</h2>
                <span className="text-sm text-gray-500">{formData.images.length}/5 images</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Product ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-gray-900/60 text-white rounded-full p-1 hover:bg-gray-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {formData.images.length < 5 && (
                  <div className="aspect-square">
                    <label 
                      htmlFor="image-upload" 
                      className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex flex-col items-center justify-center p-4">
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Upload Image</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isLoading || formData.images.length >= 5}
                        multiple
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-500">
                Upload up to 5 images. Each image should be less than 5MB.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Preview and actions */}
        <div className="md:col-span-2">
          <div className="sticky top-24 space-y-6">
            {/* Product Preview */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-2">Preview</h2>
                
                <div className="rounded-lg overflow-hidden bg-gray-100 aspect-square">
                  {formData.images.length > 0 ? (
                    <img 
                      src={formData.images[0]} 
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">No image uploaded</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">
                    {formData.name || 'Product Name'}
                  </h3>
                  {formData.price ? (
                    <p className="font-bold text-campus-blue text-xl">
                      ₹{formData.price}
                      {formData.negotiable && (
                        <span className="ml-2 text-sm bg-campus-blue-light/10 text-campus-blue-light px-2 py-0.5 rounded">
                          Negotiable
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-gray-500">Enter a price</p>
                  )}
                </div>
                
                <div className="text-sm">
                  {formData.description ? (
                    <p className="text-gray-700 line-clamp-3">{formData.description}</p>
                  ) : (
                    <p className="text-gray-500">Enter a description</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  {formData.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {formData.category}
                    </span>
                  )}
                  {formData.condition && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {formData.condition}
                    </span>
                  )}
                  {formData.location && (
                    <span className="bg-gray-100 px-2 py-1 rounded flex items-center">
                      <MapPin className="h-3 w-3 mr-1" /> 
                      {formData.location}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Button
              className="w-full button-animation"
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Listing' : 'Publish Listing'}
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
