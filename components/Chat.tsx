
import { useState, useEffect, useRef, SetStateAction } from 'react';
import { Send, MessageSquare, User } from 'lucide-react';

// Inside your Call component
const Chat = ({ chatClient, uid, messages, setMessages }: { chatClient: any; uid: any; messages: { uid: string; text: string, time: number, isLocal: boolean }[]; setMessages: SetStateAction<any> }) => {
    const [messageText, setMessageText] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false);
    const yourUid = uid || 'Me';



    // Format timestamp to readable time
    const formatTime = (timestamp: any) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Handle sending messages
    const handleSendMessage = async () => {
        if (!messageText.trim() || isSending) return;

        try {
            setIsSending(true);

            // Send the message via RTM
            await chatClient.sendMessage({ text: messageText });

            // Add message to local state
            setMessages((prev: any) => [...prev, {
                uid: yourUid,
                text: messageText,
                time: Date.now(),
                isLocal: true
            }]);

            // Clear input
            setMessageText("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Render the chat interface
    return (
        <div className="w-80 h-full flex flex-col bg-gray-900 bg-opacity-80 backdrop-blur-sm border-l border-gray-700 shadow-xl">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-blue-400 mr-2" />
                    <h3 className="text-white font-medium text-lg">Meeting Chat</h3>
                </div>
                <div className="bg-blue-500 text-xs font-bold px-2 py-1 rounded-full text-white">
                    {messages.length} messages
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                        <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-xs mt-1">Be the first to send a message!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.isLocal || msg.uid === "Me" || msg.uid === yourUid;
                        return (
                            <div
                                key={idx}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-3 py-2 ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    {!isMe ? (
                                        <div className="font-medium text-xs text-blue-300 mb-1">
                                            {msg.uid}
                                        </div>
                                    ) : <div className='text-xs text-gray-400 mb-1'>Me</div>
                                    }
                                    <div className="text-sm break-words">
                                        {msg.text}
                                    </div>
                                    <div className="text-right mt-1">
                                        <span className={`text-xs ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {msg.time ? formatTime(msg.time) : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="sticky bottom-16 p-3 border-t border-gray-700 bg-gray-800">
                <form
                    className="flex items-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (messageText.trim()) {
                            handleSendMessage();
                        }
                    }}
                >
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 focus:border-blue-500 text-white rounded-l-md focus:outline-none text-sm"
                        placeholder="Type your message..."
                    />
                    <button
                        type="submit"
                        disabled={!messageText.trim() || isSending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-800 disabled:opacity-70 flex items-center justify-center"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;