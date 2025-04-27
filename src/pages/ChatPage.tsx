
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, MessageSquare, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { messages, conversations, sendMessage, markAsRead } = useData();
  const [messageText, setMessageText] = useState('');
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(userId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create a conversation key that's the same regardless of who initiated
  const getConversationKey = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('-');
  };

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (activeChatUserId && user?.id) {
      markAsRead(activeChatUserId);
    }
  }, [activeChatUserId, user?.id, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatUserId]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChatUserId || !user) return;
    
    sendMessage(activeChatUserId, messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get conversation messages
  const chatMessages = activeChatUserId && user?.id
    ? messages[getConversationKey(user.id, activeChatUserId)] || []
    : [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-heading font-bold mb-8">Messages</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        {/* Conversation List */}
        <Card className="md:col-span-1 hidden md:block">
          <CardHeader className="px-3 py-4">
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversations.length > 0 ? (
                <div>
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.userId}
                      className={cn(
                        "w-full flex items-center p-3 hover:bg-gray-50 transition-colors",
                        activeChatUserId === conversation.userId && "bg-gray-50"
                      )}
                      onClick={() => setActiveChatUserId(conversation.userId)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          {conversation.userImage ? (
                            <AvatarImage 
                              src={conversation.userImage} 
                              alt={conversation.userName} 
                            />
                          ) : (
                            <AvatarFallback>
                              {getInitials(conversation.userName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-campus-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden text-left">
                        <div className="flex justify-between">
                          <p className="font-medium truncate">{conversation.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-gray-500">No conversations yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mobile Conversation List */}
        {!activeChatUserId && (
          <Card className="md:hidden col-span-4">
            <CardHeader className="px-4 py-4">
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length > 0 ? (
                <div>
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.userId}
                      className="w-full flex items-center p-4 hover:bg-gray-50 border-b last:border-0"
                      onClick={() => setActiveChatUserId(conversation.userId)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          {conversation.userImage ? (
                            <AvatarImage 
                              src={conversation.userImage} 
                              alt={conversation.userName} 
                            />
                          ) : (
                            <AvatarFallback>
                              {getInitials(conversation.userName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-campus-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden text-left">
                        <div className="flex justify-between">
                          <p className="font-medium">{conversation.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 mb-4">No conversations yet</p>
                  <Button asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Window */}
        {activeChatUserId ? (
          <Card className="md:col-span-3 col-span-4 flex flex-col">
            {/* Header */}
            <CardHeader className="px-4 py-4 border-b flex-shrink-0">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden mr-2"
                  onClick={() => setActiveChatUserId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  {conversations.find(c => c.userId === activeChatUserId)?.userImage ? (
                    <AvatarImage 
                      src={conversations.find(c => c.userId === activeChatUserId)?.userImage || ''} 
                      alt={conversations.find(c => c.userId === activeChatUserId)?.userName} 
                    />
                  ) : (
                    <AvatarFallback>
                      {getInitials(conversations.find(c => c.userId === activeChatUserId)?.userName || 'User')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="ml-3 text-base">
                  {conversations.find(c => c.userId === activeChatUserId)?.userName || 'Chat'}
                </CardTitle>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 h-[400px]">
              {chatMessages.length > 0 ? (
                <div className="space-y-4">
                  {chatMessages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    
                    return (
                      <div 
                        key={message.id} 
                        className={cn(
                          "flex",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div 
                          className={cn(
                            "max-w-[70%] rounded-lg px-4 py-2",
                            isOwn 
                              ? "bg-campus-blue text-white rounded-br-none" 
                              : "bg-gray-100 text-gray-900 rounded-bl-none"
                          )}
                        >
                          <p className="break-words">{message.content}</p>
                          <div 
                            className={cn(
                              "text-xs mt-1",
                              isOwn ? "text-blue-100" : "text-gray-500"
                            )}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">No messages yet</p>
                    <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t flex">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 mr-2"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!messageText.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="hidden md:flex md:col-span-3 items-center justify-center h-[500px]">
            <div className="text-center p-6">
              <div className="rounded-full bg-gray-100 p-4 mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-lg mb-1">Select a conversation</h3>
              <p className="text-gray-500">
                Choose a conversation from the list or start a new one by contacting a seller
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
