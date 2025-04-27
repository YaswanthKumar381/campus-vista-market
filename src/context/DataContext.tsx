
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

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
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  sendMessage: (receiverId: string, content: string, productId?: string) => void;
  markAsRead: (userId: string) => void;
  getUserProducts: (userId: string) => Product[];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Load initial mock data
  useEffect(() => {
    // Try to load from localStorage first
    const storedProducts = localStorage.getItem('campusMarketProducts');
    const storedWishlist = localStorage.getItem('campusMarketWishlist');
    const storedMessages = localStorage.getItem('campusMarketMessages');

    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (error) {
        console.error('Failed to parse stored products:', error);
        loadMockProducts();
      }
    } else {
      loadMockProducts();
    }

    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (error) {
        console.error('Failed to parse stored wishlist:', error);
      }
    }

    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
        
        // Generate conversations from messages
        const convos = generateConversations(parsedMessages);
        setConversations(convos);
      } catch (error) {
        console.error('Failed to parse stored messages:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('campusMarketProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('campusMarketWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('campusMarketMessages', JSON.stringify(messages));
    
    // Update conversations whenever messages change
    const convos = generateConversations(messages);
    setConversations(convos);
  }, [messages]);

  function loadMockProducts() {
    // Mock product data
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Data Structures Textbook',
        description: 'Introduction to Algorithms by Cormen, Leiserson, Rivest, and Stein. In excellent condition, barely used.',
        price: 450,
        negotiable: true,
        condition: 'Like New',
        category: 'Books',
        location: 'Boys Hostel Block A',
        images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e'],
        sellerId: 'user1',
        sellerName: 'Rahul Kumar',
        sellerImage: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=random',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      },
      {
        id: '2',
        name: 'HP Laptop - 8GB RAM, 512GB SSD',
        description: 'HP Pavilion laptop in great working condition. 8GB RAM, 512GB SSD, Intel Core i5 processor.',
        price: 25000,
        negotiable: true,
        condition: 'Good',
        category: 'Electronics',
        location: 'Girls Hostel Block C',
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853'],
        sellerId: 'user2',
        sellerName: 'Priya Sharma',
        sellerImage: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      },
      {
        id: '3',
        name: 'Scientific Calculator',
        description: 'Casio FX-991EX Scientific Calculator. All buttons working, slight scratch on screen.',
        price: 800,
        negotiable: false,
        condition: 'Good',
        category: 'Electronics',
        location: 'Boys Hostel Block B',
        images: ['https://images.unsplash.com/photo-1564466809058-bf4114d55352'],
        sellerId: 'user3',
        sellerName: 'Vikram Singh',
        sellerImage: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=random',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      },
      {
        id: '4',
        name: 'College Hoodie - Size L',
        description: 'IIIT RK Valley hoodie, size L. Worn only a few times, in excellent condition.',
        price: 350,
        negotiable: true,
        condition: 'Like New',
        category: 'Clothing',
        location: 'Girls Hostel Block A',
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7'],
        sellerId: 'user4',
        sellerName: 'Anjali Reddy',
        sellerImage: 'https://ui-avatars.com/api/?name=Anjali+Reddy&background=random',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      },
      {
        id: '5',
        name: 'Wireless Mouse',
        description: 'Logitech M185 Wireless Mouse. Works perfectly, battery included.',
        price: 500,
        negotiable: false,
        condition: 'New',
        category: 'Electronics',
        location: 'Boys Hostel Block C',
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7'],
        sellerId: 'user5',
        sellerName: 'Karthik Nair',
        sellerImage: 'https://ui-avatars.com/api/?name=Karthik+Nair&background=random',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      },
      {
        id: '6',
        name: 'Desk Lamp',
        description: 'Adjustable LED desk lamp with 3 brightness levels. USB charging port included.',
        price: 600,
        negotiable: true,
        condition: 'Like New',
        category: 'Home & Decor',
        location: 'Girls Hostel Block B',
        images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15'],
        sellerId: 'user6',
        sellerName: 'Meera Patel',
        sellerImage: 'https://ui-avatars.com/api/?name=Meera+Patel&background=random',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      }
    ];

    setProducts(mockProducts);
    localStorage.setItem('campusMarketProducts', JSON.stringify(mockProducts));
  }

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
    // Placeholder - in a real app, you'd look up the username
    return `User ${userId.substring(0, 4)}`;
  }
  
  function getUserImage(userId: string): string {
    // Placeholder - in a real app, you'd look up the user's image
    return `https://ui-avatars.com/api/?name=${getUserName(userId)}&background=random`;
  }

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      status: 'Active'
    };
    
    setProducts(prev => [newProduct, ...prev]);
    toast.success("Product listed successfully!");
    return newProduct.id;
  };
  
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updates } : product
      )
    );
    toast.success("Product updated successfully!");
  };
  
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    toast.success("Product removed successfully!");
  };
  
  const addToWishlist = (productId: string) => {
    if (!wishlist.includes(productId)) {
      setWishlist(prev => [...prev, productId]);
      toast.success("Added to wishlist!");
    }
  };
  
  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
    toast.success("Removed from wishlist");
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
    getUserProducts
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
