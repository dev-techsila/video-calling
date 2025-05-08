'use client';
import { useParams, useSearchParams } from 'next/navigation';
import Call from '../../../components/Call';
import { useEffect, useState } from 'react';

export default function Page() {
    const params = useParams();
    const searchParams = useSearchParams();

    const channelName = params.channelName;
    const token = searchParams.get('token');
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (token) {
            fetch(`https://taskimony.com/api/validate-meeting-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
                mode: 'cors'
            }).then(res => {
                if (res.ok) {
                    setIsTokenValid(true);
                } else {
                    setIsTokenValid(false);
                }
            }).catch(() => {
                setIsTokenValid(false);
            });
        } else {
            setIsTokenValid(false); // no token provided
        }
    }, [token]);

    if (!appId) {
        console.error("Missing NEXT_PUBLIC_AGORA_APP_ID in .env file");
        return <div>Error: Missing app ID</div>;
    }

    if (isTokenValid === null) {
        return <div>Validating token...</div>; // optional loading state
    }

    if (isTokenValid === false) {
        return <div>Invalid or expired meeting token. Access denied.</div>;
    }

    return (
        <main className="flex w-full flex-col">
            <Call
                appId={appId}
                channelName={channelName}
            />
        </main>
    );
}
