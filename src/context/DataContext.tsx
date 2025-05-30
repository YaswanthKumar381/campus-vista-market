
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define types
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  category: string;
  location: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerImage?: string;
  sellerPhone?: string;
  createdAt: string;
  status: 'Active' | 'Sold' | 'Reserved';
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  productId?: string;
  read: boolean;
};

export type Conversation = {
  userId: string;
  userName: string;
  userImage?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
};

type DataContextType = {
  products: Product[];
  wishlist: string[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string, productId?: string) => void;
  markAsRead: (userId: string) => void;
  getUserProducts: (userId: string) => Product[];
  fetchProducts: () => Promise<void>;
  fetchWishlistedProducts: () => Promise<Product[]>;
  loading: boolean;
  wishlistLoading: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// Maximum number of retries for fetching data
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 1000;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchProducts();
    fetchWishlist();
    fetchMessages();
  }, []);

  // Set up real-time subscription for products
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          console.log('Product change received, refreshing products...');
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Set up real-time subscription for wishlists
  useEffect(() => {
    const setupWishlistRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const channel = supabase
        .channel('wishlists-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wishlists'
          },
          () => {
            console.log('Wishlist change received, refreshing wishlist...');
            fetchWishlist();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupWishlistRealtime();
  }, []);

  // Helper function for retrying fetch operations
  const fetchWithRetry = async (operation: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying operation, ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(operation, retries - 1);
      }
      throw error;
    }
  };

  // Fetch products from Supabase with pagination to avoid timeouts
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      
      // Use pagination to avoid timeout issues
      const PAGE_SIZE = 10; // Reduced page size to minimize timeouts
      let allProducts: any[] = [];
      let hasMoreData = true;
      let currentPage = 0;
      
      while (hasMoreData && currentPage < 3) { // Limit to 3 pages (30 products) to avoid excessive calls
        try {
          const { data, error } = await supabase
            .from('products')
            .select(`
              id, 
              title, 
              description, 
              price, 
              negotiable, 
              condition, 
              category, 
              location, 
              images, 
              seller_id, 
              status, 
              created_at
            `)
            .eq('status', 'Active') // Only fetch active products
            .order('created_at', { ascending: false })
            .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);
          
          if (error) {
            console.error(`Error fetching products batch (page ${currentPage}):`, error);
            currentPage++;
            continue;
          }
          
          if (!data || data.length === 0) {
            hasMoreData = false;
            break;
          }
          
          if (data.length < PAGE_SIZE) {
            hasMoreData = false;
          }
          
          allProducts = [...allProducts, ...data];
          currentPage++;
          
          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Error fetching products batch (page ${currentPage}):`, err);
          currentPage++;
        }
      }
      
      if (allProducts.length === 0) {
        console.log('No products found');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      console.log(`Found ${allProducts.length} products`);

      // Get all unique seller IDs
      const sellerIds = [...new Set(allProducts.map(product => product.seller_id))];
      
      // Create a map of profiles for faster lookup
      const profilesMap = new Map();
      
      // Fetch profiles in smaller batches
      if (sellerIds.length > 0) {
        for (let i = 0; i < sellerIds.length; i += 5) {
          const batchSellerIds = sellerIds.slice(i, i + 5);
          
          try {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, phone_number')
              .in('id', batchSellerIds);
            
            if (profilesData && profilesData.length > 0) {
              profilesData.forEach(profile => {
                profilesMap.set(profile.id, profile);
              });
            }
          } catch (error) {
            console.error('Error fetching profiles batch:', error);
          }
        }
      }

      // Transform and combine the data
      const transformedProducts = allProducts.map(item => {
        const sellerProfile = profilesMap.get(item.seller_id);
        return {
          id: item.id,
          name: item.title,
          description: item.description || '',
          price: item.price,
          negotiable: item.negotiable,
          condition: item.condition as any,
          category: item.category,
          location: item.location || '',
          images: item.images || [],
          sellerId: item.seller_id,
          sellerName: sellerProfile ? sellerProfile.full_name : 'Unknown User',
          sellerImage: sellerProfile ? sellerProfile.avatar_url : undefined,
          sellerPhone: sellerProfile ? sellerProfile.phone_number : undefined,
          createdAt: item.created_at,
          status: item.status as any || 'Active',
        };
      });

      setProducts(transformedProducts);
      console.log('Products fetched successfully');
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      toast.error('Something went wrong when loading products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's wishlist with real-time updates
  const fetchWishlist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, skipping wishlist fetch');
        return;
      }

      console.log('Fetching wishlist...');
      
      const { data, error } = await fetchWithRetry(async () => {
        return await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', session.user.id);
      });

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      const wishlistIds = data ? data.map(item => item.product_id) : [];
      console.log(`Found ${wishlistIds.length} items in wishlist`);
      setWishlist(wishlistIds);
    } catch (error) {
      console.error('Error in fetchWishlist:', error);
    }
  };
  
  // Fetch products in the user's wishlist
  const fetchWishlistedProducts = async (): Promise<Product[]> => {
    try {
      setWishlistLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, skipping wishlist products fetch');
        return [];
      }
      
      // Get the list of product IDs in the wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', session.user.id);
        
      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        return [];
      }
      
      if (!wishlistData || wishlistData.length === 0) {
        return [];
      }
      
      const wishlistIds = wishlistData.map(item => item.product_id);
      
      // Fetch products in the wishlist, split into smaller batches if needed
      const BATCH_SIZE = 10;
      let wishlistProducts: any[] = [];
      
      for (let i = 0; i < wishlistIds.length; i += BATCH_SIZE) {
        const batchIds = wishlistIds.slice(i, i + BATCH_SIZE);
        
        try {
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select(`
              id, 
              title, 
              description, 
              price, 
              negotiable, 
              condition, 
              category, 
              location, 
              images, 
              seller_id, 
              status, 
              created_at
            `)
            .in('id', batchIds);
            
          if (productsError) {
            console.error(`Error fetching wishlist products batch:`, productsError);
            continue;
          }
          
          if (productsData && productsData.length > 0) {
            wishlistProducts = [...wishlistProducts, ...productsData];
          }
        } catch (error) {
          console.error(`Error in wishlist products batch:`, error);
        }
      }
      
      // Get seller profiles for the products
      const sellerIds = [...new Set(wishlistProducts.map(product => product.seller_id))];
      const profilesMap = new Map();
      
      if (sellerIds.length > 0) {
        for (let i = 0; i < sellerIds.length; i += 5) {
          const batchSellerIds = sellerIds.slice(i, i + 5);
          
          try {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, phone_number')
              .in('id', batchSellerIds);
            
            if (profilesData && profilesData.length > 0) {
              profilesData.forEach(profile => {
                profilesMap.set(profile.id, profile);
              });
            }
          } catch (error) {
            console.error('Error fetching profiles batch for wishlist:', error);
          }
        }
      }
      
      // Transform products data
      const transformedProducts = wishlistProducts.map(item => {
        const sellerProfile = profilesMap.get(item.seller_id);
        return {
          id: item.id,
          name: item.title,
          description: item.description || '',
          price: item.price,
          negotiable: item.negotiable,
          condition: item.condition as any,
          category: item.category,
          location: item.location || '',
          images: item.images || [],
          sellerId: item.seller_id,
          sellerName: sellerProfile ? sellerProfile.full_name : 'Unknown User',
          sellerImage: sellerProfile ? sellerProfile.avatar_url : undefined,
          sellerPhone: sellerProfile ? sellerProfile.phone_number : undefined,
          createdAt: item.created_at,
          status: item.status as any || 'Active',
        };
      });
      
      return transformedProducts;
    } catch (error) {
      console.error('Error fetching wishlisted products:', error);
      return [];
    } finally {
      setWishlistLoading(false);
    }
  };

  // For now, continue using localStorage for messages until we implement that in Supabase
  const fetchMessages = async () => {
    const storedMessages = localStorage.getItem('campusMarketMessages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
        const convos = generateConversations(parsedMessages);
        setConversations(convos);
      } catch (error) {
        console.error('Failed to parse stored messages:', error);
      }
    }
  };

  function generateConversations(messagesData: Record<string, Message[]>): Conversation[] {
    const userConversations = new Map<string, Conversation>();
    
    // Process all messages to generate conversations
    Object.values(messagesData).flat().forEach(message => {
      const currentUser = localStorage.getItem('campusMarketUser') 
        ? JSON.parse(localStorage.getItem('campusMarketUser')!).id 
        : '';
      
      // Determine the other user in the conversation
      const otherUserId = message.senderId === currentUser ? message.receiverId : message.senderId;
      
      const existing = userConversations.get(otherUserId);
      const timestamp = new Date(message.timestamp);
      
      if (!existing || new Date(existing.timestamp) < timestamp) {
        // Get or create conversation
        const conversation: Conversation = existing || {
          userId: otherUserId,
          userName: getUserName(otherUserId),
          userImage: getUserImage(otherUserId),
          lastMessage: message.content,
          timestamp: message.timestamp,
          unreadCount: 0
        };
        
        // Update with latest message
        conversation.lastMessage = message.content;
        conversation.timestamp = message.timestamp;
        
        // Count unread messages
        if (message.senderId !== currentUser && !message.read) {
          conversation.unreadCount = (existing?.unreadCount || 0) + 1;
        }
        
        userConversations.set(otherUserId, conversation);
      }
    });
    
    // Convert map to array and sort by timestamp (newest first)
    return Array.from(userConversations.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  function getUserName(userId: string): string {
    return `User ${userId.substring(0, 4)}`;
  }
  
  function getUserImage(userId: string): string {
    return `https://ui-avatars.com/api/?name=${getUserName(userId)}&background=random`;
  }

  // Create a new product
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to create a product');
      }

      // Transform the data to match Supabase schema
      const supabaseProduct = {
        title: productData.name,
        description: productData.description,
        price: productData.price,
        negotiable: productData.negotiable,
        condition: productData.condition,
        category: productData.category,
        location: productData.location,
        images: productData.images,
        seller_id: session.user.id,
        status: 'Active',
      };

      const { data, error } = await supabase
        .from('products')
        .insert(supabaseProduct)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating product:', error);
        toast.error('Failed to create product: ' + error.message);
        throw error;
      }

      toast.success("Product listed successfully!");
      return data.id;
    } catch (error) {
      console.error('Error in createProduct:', error);
      toast.error('Something went wrong. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    try {
      // Transform updates to match Supabase schema
      const supabaseUpdates: any = {};
      
      if (updates.name !== undefined) supabaseUpdates.title = updates.name;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.price !== undefined) supabaseUpdates.price = updates.price;
      if (updates.negotiable !== undefined) supabaseUpdates.negotiable = updates.negotiable;
      if (updates.condition !== undefined) supabaseUpdates.condition = updates.condition;
      if (updates.category !== undefined) supabaseUpdates.category = updates.category;
      if (updates.location !== undefined) supabaseUpdates.location = updates.location;
      if (updates.images !== undefined) supabaseUpdates.images = updates.images;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;

      const { error } = await supabase
        .from('products')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        toast.error('Failed to update product');
        throw error;
      }

      // Refresh products
      await fetchProducts();
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error('Error in updateProduct:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a product
  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
        throw error;
      }

      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success("Product removed successfully!");
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add product to wishlist
  const addToWishlist = async (productId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to save to wishlist");
        return;
      }

      if (!wishlist.includes(productId)) {
        const { error } = await fetchWithRetry(async () => {
          return await supabase
            .from('wishlists')
            .insert({
              product_id: productId,
              user_id: session.user.id
            });
        });

        if (error) {
          console.error('Error adding to wishlist:', error);
          toast.error('Failed to add to wishlist: ' + error.message);
          return;
        }

        setWishlist(prev => [...prev, productId]);
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      console.error('Error in addToWishlist:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };
  
  // Remove product from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to manage your wishlist");
        return;
      }

      const { error } = await fetchWithRetry(async () => {
        return await supabase
          .from('wishlists')
          .delete()
          .match({
            product_id: productId,
            user_id: session.user.id
          });
      });

      if (error) {
        console.error('Error removing from wishlist:', error);
        toast.error('Failed to remove from wishlist');
        return;
      }

      setWishlist(prev => prev.filter(id => id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error('Error in removeFromWishlist:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };
  
  const sendMessage = (receiverId: string, content: string, productId?: string) => {
    const currentUser = localStorage.getItem('campusMarketUser') 
      ? JSON.parse(localStorage.getItem('campusMarketUser')!).id 
      : '';
    
    if (!currentUser) {
      toast.error("You must be logged in to send messages");
      return;
    }

    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      senderId: currentUser,
      receiverId,
      content,
      productId,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Create a conversation key that's the same regardless of who initiated
    const conversationKey = [currentUser, receiverId].sort().join('-');
    
    setMessages(prev => {
      const existingMessages = prev[conversationKey] || [];
      return {
        ...prev,
        [conversationKey]: [...existingMessages, newMessage]
      };
    });
  };

  const markAsRead = (userId: string) => {
    const currentUser = localStorage.getItem('campusMarketUser') 
      ? JSON.parse(localStorage.getItem('campusMarketUser')!).id 
      : '';
    
    if (!currentUser) return;
    
    // Create a conversation key that's the same regardless of who initiated
    const conversationKey = [currentUser, userId].sort().join('-');
    
    setMessages(prev => {
      const existingMessages = prev[conversationKey] || [];
      const updatedMessages = existingMessages.map(msg => 
        msg.senderId === userId && !msg.read ? { ...msg, read: true } : msg
      );
      
      return { ...prev, [conversationKey]: updatedMessages };
    });
  };

  const getUserProducts = (userId: string) => {
    return products.filter(product => product.sellerId === userId);
  };

  const value = {
    products,
    wishlist,
    conversations,
    messages,
    createProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    removeFromWishlist,
    sendMessage,
    markAsRead,
    getUserProducts,
    fetchProducts,
    fetchWishlistedProducts,
    loading,
    wishlistLoading
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
