import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

const ChatbotButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm QuickCart AI. How can I assist you with your shopping today?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const AI_URL = (import.meta.env.VITE_AI_SERVICE_URL || 'https://quickcart-ai-ecommerce-app.onrender.com/api').replace(/\/+$/, '');
            const response = await fetch(`${AI_URL}/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text })
            });
            const data = await response.json();

            let aiReply = "Sorry, I couldn't reach the server right now.";
            if (response.ok && data.status === 'success') {
                aiReply = data.response;
            } else if (data.error) {
                aiReply = "Error: " + data.error;
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiReply, sender: 'ai' }]);
        } catch (error) {
            console.error("Chatbot Fetch Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Network error trying to reach AI Service. Please ensure the Python server is running.",
                sender: 'ai'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-[100] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shrink-0 flex items-center justify-between shadow-md">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                                    <Bot className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold flex items-center gap-1">
                                        QuickCart AI <Sparkles className="w-4 h-4 text-yellow-300" />
                                    </h3>
                                    <p className="text-blue-100 text-xs flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Context */}
                        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[80%] items-end space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-purple-100 text-purple-600'}`}>
                                            {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                        </div>
                                        <div className={`px-4 py-2.5 rounded-2xl ${msg.sender === 'user'
                                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-br-sm'
                                                : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-bl-sm'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex max-w-[80%] items-end space-x-2">
                                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-purple-100 text-purple-600">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm flex space-x-1.5 items-center">
                                            <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                                            <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                                            <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-100 border-none rounded-full px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-slate-400 mt-2">
                                QuickCart AI can make mistakes. Consider verifying important information.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Bubble Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-purple-600 to-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 z-[90] transition-colors focus:outline-none ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => setIsOpen(true)}
            >
                <MessageSquare className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            </motion.button>
        </>
    );
};

export default ChatbotButton;
