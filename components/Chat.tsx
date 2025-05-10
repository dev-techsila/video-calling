import React, { useState, useEffect } from 'react'
import AgoraRTM from "agora-rtm-sdk";
import { useRemoteUsers } from 'agora-rtc-react';



const Chat = ({ appId, channelName, rtmUid, setLocations }: any) => {
    const [chatClient, setChatClient] = useState<any>(null);
    const [messages, setMessages] = useState<{ uid: string; text: string }[]>([]);
    const [messageText, setMessageText] = useState("");

    const remoteUsers = useRemoteUsers()


    useEffect(() => {

        const init = async () => {
            try {
                const rtmToken = await getRTMToken(rtmUid);
                const rtmClient = AgoraRTM.createInstance(appId);
                await rtmClient.login({ uid: String(rtmUid), token: rtmToken });
                const channel = await rtmClient.createChannel(channelName);
                await channel.join();

                channel.on("ChannelMessage", ({ text }, senderId) => {
                    try {
                        if (text) {
                            const message = JSON.parse(text);
                            if (message.type === "location" && message.data) {
                                setLocations((prev: any) => ({
                                    ...prev,
                                    [senderId]: message.data,
                                }));
                            } else {
                                setMessages((prev) => [...prev, { uid: senderId, text }]);
                            }
                        }

                    } catch {
                        if (text)
                            setMessages((prev) => [...prev, { uid: senderId, text }]);
                    }
                });

                setChatClient(channel);
            } catch (err) {
                console.error("Initialization failed", err);
            }
        };

        if (remoteUsers.length > 0) init();
        init();

        return () => {
            (async () => {
                if (chatClient) {
                    await chatClient.leave();
                    await chatClient.client.logout();
                }
            })();
        };
    }, [remoteUsers]);


    async function getRTMToken(uid: string) {
        try {
            const res = await fetch('/api/rtm-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid }),
            });
            if (!res.ok) throw new Error('HTTP error');
            const data = await res.json();
            return data.token;
        } catch (err) {
            console.error("RTM Token Error:", err);
            throw err;
        }
    }


    const handleSendMessage = async () => {
        console.log(messageText)
        if (chatClient && messageText.trim()) {
            await chatClient.sendMessage({ text: messageText });
            setMessages((prev) => [...prev, { uid: "Me", text: messageText }]);
            setMessageText("");
        }
    };

    if (remoteUsers.length > 0)
        return (
            <div className="w-80 h-full bg-gray-900 bg-opacity-70 p-4 overflow-y-auto">
                <div className="text-white text-lg font-semibold mb-2">Chat</div>
                <div className="flex flex-col space-y-2 h-[80%] overflow-y-auto">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="text-sm text-white">
                            <strong>{msg.uid}:</strong> {msg.text}
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-gray-700 text-white"
                        placeholder="Type a message"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="ml-2 px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-700"
                    >
                        Send
                    </button>
                </div>
            </div>
        )
}

export default Chat