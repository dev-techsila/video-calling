"use client";

import AgoraRTC, {
    AgoraRTCProvider,
    LocalVideoTrack,
    RemoteUser,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRTCClient,
    useRemoteAudioTracks,
    useRemoteUsers,
} from "agora-rtc-react";

import AgoraRTM from "agora-rtm-sdk";

import {
    PhoneXMarkIcon,
    MicrophoneIcon,
    SignalSlashIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
} from "@heroicons/react/24/solid";

import { useEffect, useState, useRef } from "react";
import axios from "axios";

function Call(props: { appId: string; channelName: string }) {
    const [isRecording, setIsRecording] = useState(false);
    const [resourceId, setResourceId] = useState<string | null>(null);
    const [sid, setSid] = useState<string | null>(null);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [chatClient, setChatClient] = useState(null);
    const [messages, setMessages] = useState<{ uid: string; text: string }[]>([]);
    const [messageText, setMessageText] = useState("");
    const [rtcToken, setRtcToken] = useState(null);
    const [uid, setUid] = useState('');

    const client = useRTCClient(
        AgoraRTC.createClient({ codec: "vp8", mode: "live" })
    );

    const handleRecording = async () => {
        if (!isRecording) {
            const response = await axios.post("/api/start-recording", {
                channelName: props.channelName,
            });
            const { resourceId, sid } = response.data;
            setResourceId(resourceId);
            setSid(sid);
            setIsRecording(true);
        } else {
            await axios.post("/api/stop-recording", {
                channelName: props.channelName,
                resourceId,
                sid,
            });
            setIsRecording(false);
            setResourceId(null);
            setSid(null);
        }
    };

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const init = async () => {
            try {
                const generatedUid = String(Math.floor(Math.random() * 100000));
                const generatedUidRtm = `user_${Math.random().toString(36).substring(2, 12)}`;
                setUid(generatedUid);

                const [rtcToken, rtmToken] = await Promise.all([
                    getRTCToken(generatedUid),
                    getRTMToken(generatedUidRtm)
                ]);
                setRtcToken(rtcToken);

                // const rtmClient = AgoraRTM.createInstance(props.appId);
                // await rtmClient.login({ uid: generatedUid, token: rtmToken });

                // const channel = await rtmClient.createChannel(props.channelName);
                // await channel.join();

                // channel.on("ChannelMessage", ({ text }, senderId) => {
                //     if (text) {
                //         setMessages((prev) => [...prev, { uid: senderId, text }]);
                //     }
                // });

                // setChatClient(channel);
            } catch (err) {
                console.error("Initialization failed", err);
            }
        };

        init();

        // return () => {
        //     (async () => {
        //         if (chatClient) {
        //             await chatClient.leave();
        //             await chatClient.client.logout();
        //         }
        //     })();
        // };
    }, []);

    // const handleSendMessage = async () => {
    //     if (chatClient && messageText.trim()) {
    //         await chatClient.sendMessage({ text: messageText });
    //         setMessages((prev) => [...prev, { uid: "Me", text: messageText }]);
    //         setMessageText("");
    //     }
    // };

    async function getRTCToken(uid: any) {
        const res = await fetch('/api/rtc-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, channelName: props.channelName }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to get RTC token');
        return data.token;
    }

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

    return (
        <AgoraRTCProvider client={client}>
            <div className="flex flex-col h-screen bg-gray-800 relative">
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 p-4">
                        {
                            rtcToken && <Videos
                                channelName={props.channelName}
                                AppID={props.appId}
                                isMicMuted={isMicMuted}
                                isCameraOff={isCameraOff}
                                token={rtcToken}
                                uid={uid}
                            />
                        }
                    </div>
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
                                // onClick={handleSendMessage}
                                className="ml-2 px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-700"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AgoraRTCProvider>
    );
}



function Videos({ channelName, AppID, isMicMuted, isCameraOff, token, uid }: any) {
    const { isLoading: isLoadingMic, localMicrophoneTrack } =
        useLocalMicrophoneTrack();
    const { isLoading: isLoadingCam, localCameraTrack } =
        useLocalCameraTrack();
    const remoteUsers = useRemoteUsers();
    const { audioTracks } = useRemoteAudioTracks(remoteUsers);
    usePublish([localMicrophoneTrack, localCameraTrack]);

    useJoin({ appid: AppID, channel: channelName, token, uid });

    useEffect(() => {
        audioTracks.forEach((track) => track.play());
    }, [audioTracks]);

    useEffect(() => {
        if (localMicrophoneTrack) {
            localMicrophoneTrack.setEnabled(!isMicMuted);
        }
    }, [isMicMuted, localMicrophoneTrack]);

    useEffect(() => {
        if (localCameraTrack) {
            localCameraTrack.setEnabled(!isCameraOff);
        }
    }, [isCameraOff, localCameraTrack]);

    return (
        <div className="flex flex-wrap gap-4 justify-center items-center h-full">
            {localCameraTrack && <LocalVideoTrack track={localCameraTrack} play />}
            {remoteUsers.map((user) => (
                <RemoteUser key={user.uid} user={user} />
            ))}
        </div>
    );
}

export default Call;