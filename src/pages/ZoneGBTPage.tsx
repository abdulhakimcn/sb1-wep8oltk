import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, Plus, Brain, X, Clock, ChevronDown, Search, History, Bookmark, MoreVertical, Loader, Mic, Clipboard, Sparkles, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Conversation } from '../types/chat';
import { getKimsoulResponse } from '../services/openai';
import { useVoiceInput } from '../hooks/useVoiceInput';
import KimsoulLogo from '../components/KimsoulLogo';
import ZoneGPTSidebar from '../components/ZoneGPTSidebar';
import { useTranslation } from 'react-i18next';

const ZoneGBTPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quick suggestions
  const suggestions = [
    t('zoneGBT.suggestions.summarize'),
    t('zoneGBT.suggestions.writePost'),
    t('zoneGBT.suggestions.explainECG')
  ];

  // Get active conversation
  const activeConversation = activeConversationId 
    ? conversations.find(c => c.id === activeConversationId) 
    : conversations[0];

  // Voice input hook
  const { 
    isRecording, 
    isTranscribing, 
    error: voiceError, 
    startRecording, 
    stopRecording 
  } = useVoiceInput({
    onTranscriptionComplete: (text) => {
      setInputValue(text);
    }
  });

  // Initialize with a default conversation if none exists
  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = localStorage.getItem('kimsoul_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Convert string dates back to Date objects
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
        setActiveConversationId(conversationsWithDates[0]?.id || null);
      } catch (error) {
        console.error('Error parsing saved conversations:', error);
        createInitialConversation();
      }
    } else {
      createInitialConversation();
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('kimsoul_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createInitialConversation = () => {
    const newConversation = createNewConversation();
    setConversations([newConversation]);
    setActiveConversationId(newConversation.id);
  };

  const createNewConversation = (): Conversation => {
    const id = Date.now().toString();
    const welcomeMessage: Message = {
      id: `welcome-${id}`,
      role: 'assistant',
      content: "مرحبًا، أنا كيمسول… صوت الدكتور عبدالحكيم الرقمي. اسألني أي شيء، فأنا هنا لأكون معك في رحلتك الطبية والإنسانية.\n\n👋 Hello Doctor, I'm Kimsoul – your AI companion in research, diagnostics, and inspiration. How can I assist you today?",
      timestamp: new Date()
    };
    
    return {
      id,
      title: 'New Conversation',
      messages: [welcomeMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  const handleNewConversation = () => {
    const newConversation = createNewConversation();
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
    setInputValue('');
    setConnectionError(false);
  };

  const handleDeleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    
    // If the active conversation is deleted, set the first conversation as active
    if (activeConversationId === id) {
      setActiveConversationId(updatedConversations[0]?.id || null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeConversationId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    // Update conversation with user message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        // Update conversation title if it's the first user message
        const isFirstUserMessage = !conv.messages.some(m => m.role === 'user');
        const newTitle = isFirstUserMessage 
          ? inputValue.trim().substring(0, 30) + (inputValue.length > 30 ? '...' : '') 
          : conv.title;
        
        return {
          ...conv,
          title: newTitle,
          messages: [...conv.messages, userMessage],
          updatedAt: new Date()
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setInputValue('');
    setIsLoading(true);
    setConnectionError(false);
    
    try {
      // Prepare messages for API call
      const currentConversation = updatedConversations.find(c => c.id === activeConversationId);
      if (!currentConversation) throw new Error("Conversation not found");
      
      // Simulate API call for demo purposes
      // In a real implementation, this would call the OpenAI API
      const simulateApiResponse = async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 20% chance of connection error for demonstration
        if (Math.random() < 0.2) {
          throw new Error("Connection error");
        }
        
        // Generate a response based on the last user message
        const lastUserMessage = currentConversation.messages
          .filter(m => m.role === 'user')
          .pop();
          
        if (!lastUserMessage) return "I'm not sure I understand. Could you please provide more details?";
        
        // Simple response patterns
        if (lastUserMessage.content.toLowerCase().includes("hello") || 
            lastUserMessage.content.toLowerCase().includes("hi")) {
          return "Hello! I'm Kimsoul, your medical AI assistant. How can I help you today?";
        }
        
        if (lastUserMessage.content.toLowerCase().includes("help")) {
          return "I'm here to help with medical questions, research summaries, and clinical information. What specific topic would you like assistance with?";
        }
        
        if (lastUserMessage.content.toLowerCase().includes("summarize")) {
          return "I'd be happy to summarize medical content for you. Please share the text or article you'd like me to summarize.";
        }
        
        // Default response
        return "Thank you for your question. I'm currently in demonstration mode with limited functionality. In the full version, I can provide detailed medical information, help with research, and assist with clinical questions. Is there a specific medical topic you're interested in?";
      };
      
      // Get response (simulated for demo)
      const responseContent = await simulateApiResponse();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      // Update conversation with assistant response
      const finalConversations = updatedConversations.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, assistantMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      });
      
      setConversations(finalConversations);
    } catch (error) {
      console.error('Error calling API:', error);
      setConnectionError(true);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "المساعد الذكي كيمسول غير متصل حاليًا. أعد المحاولة لاحقًا أو تحقق من الاتصال.\n\nKimsoul AI assistant is currently unavailable. Please try again later or check your connection.",
        timestamp: new Date()
      };
      
      const errorConversations = updatedConversations.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      });
      
      setConversations(errorConversations);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <>
      <Helmet>
        <title>ZoneGPT - Kimsoul Medical AI Assistant | Dr.Zone AI</title>
        <meta name="description" content="Interact with Kimsoul, your AI medical assistant for research, diagnostics, and medical information." />
        <link rel="icon" href="/drzone-icon.svg" />
      </Helmet>
      
      <div className="h-[calc(100vh-64px)] bg-gray-900">
        <div className="container-custom h-full py-4">
          <div className="flex h-full overflow-hidden rounded-xl bg-white shadow-lg">
            {/* Left Sidebar */}
            {showSidebar && (
              <ZoneGPTSidebar
                conversations={conversations}
                activeConversationId={activeConversationId || ''}
                onSelectConversation={setActiveConversationId}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            )}
            
            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div className="flex items-center">
                  {!showSidebar && (
                    <button 
                      className="mr-3 rounded-md p-1 text-gray-500 hover:bg-gray-100"
                      onClick={() => setShowSidebar(true)}
                    >
                      <Brain size={20} />
                    </button>
                  )}
                  <div className="flex items-center">
                    <KimsoulLogo size={32} className="mr-2" />
                    <div>
                      <h3 className="font-semibold text-indigo-700">Kimsoul Medical Assistant</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        <span>24h context memory</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                    <Bookmark size={18} />
                  </button>
                  <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                    <MoreVertical size={18} />
                  </button>
                  {showSidebar && (
                    <button 
                      className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                      onClick={() => setShowSidebar(false)}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-indigo-50 to-white p-6">
                {connectionError && (
                  <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>Unable to connect to the AI service. Please check your internet connection and try again.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  {activeConversation?.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'user' ? (
                        <div className="max-w-3xl rounded-lg bg-indigo-600 p-4 text-white">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ) : (
                        <div className="max-w-3xl rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center mb-2">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: 0, duration: 1 }}
                            >
                              <KimsoulLogo size={32} />
                            </motion.div>
                            <div className="ml-2">
                              <span className="font-semibold text-indigo-700">Kimsoul</span>
                              <div className="text-xs text-gray-500">Dr.Zone AI Assistant</div>
                            </div>
                          </div>
                          
                          <div className="prose prose-sm max-w-none">
                            {message.content.split('\n').map((line, i) => (
                              <React.Fragment key={i}>
                                {line}
                                {i < message.content.split('\n').length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center border-t border-gray-100 pt-2">
                            <div className="flex space-x-2">
                              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                                <ThumbsUp size={12} className="mr-1" />
                                Helpful
                              </button>
                              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                                <ThumbsDown size={12} className="mr-1" />
                                Not helpful
                              </button>
                            </div>
                            <button 
                              onClick={() => navigator.clipboard.writeText(message.content)}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                            >
                              <Clipboard size={12} className="mr-1" />
                              Copy
                            </button>
                          </div>
                          
                          {/* Watermark */}
                          <div className="mt-1 text-right">
                            <span className="text-[10px] text-gray-400">Powered by Dr.Zone AI – HakeemZone™</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center mb-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <KimsoulLogo size={32} />
                          </motion.div>
                          <div className="ml-2">
                            <span className="font-semibold text-indigo-700">Kimsoul</span>
                            <div className="text-xs text-gray-500">Dr.Zone AI Assistant</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          <span className="text-sm text-gray-500">{t('zoneGBT.thinking')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="rounded-lg border border-gray-300 bg-white overflow-hidden shadow-sm">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('zoneGBT.askQuestion')}
                    className="w-full px-4 py-3 text-sm outline-none resize-none min-h-[60px] max-h-[200px]"
                    rows={2}
                    disabled={isLoading || isRecording || isTranscribing}
                  />
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleVoiceInput}
                        className={`rounded-md p-1.5 ${isRecording ? 'text-red-500 bg-red-100' : 'text-gray-500 hover:bg-gray-200'}`}
                        title={isRecording ? 'Stop recording' : 'Start voice input'}
                      >
                        <Mic size={18} />
                      </button>
                      <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200">
                        <Clipboard size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || isRecording || isTranscribing}
                      className="rounded-md bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
                
                {/* Quick Suggestions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center space-x-1 rounded-full bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      <Sparkles size={14} className="text-indigo-500" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
                
                {voiceError && (
                  <div className="mt-2 text-xs text-red-500">
                    {voiceError}
                  </div>
                )}
                
                {(isRecording || isTranscribing) && (
                  <div className="mt-2 text-xs text-indigo-600 flex items-center">
                    {isRecording ? (
                      <>
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                        Recording... (click mic to stop)
                      </>
                    ) : (
                      <>
                        <Loader size={12} className="mr-2 animate-spin" />
                        Transcribing your voice...
                      </>
                    )}
                  </div>
                )}
                
                <div className="mt-2 text-center text-xs text-gray-500">
                  <span>{t('zoneGBT.disclaimer')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ZoneGBTPage;