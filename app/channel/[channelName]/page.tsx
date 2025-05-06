'use client';
import { useParams } from 'next/navigation';
import Call from '../../../components/Call';


export default function Page() {
    const params = useParams();
    const channelName = params.channelName;
    console.log(channelName, process.env.NEXT_PUBLIC_AGORA_APP_ID);
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

    if (!appId) {
        console.error("Missing NEXT_PUBLIC_AGORA_APP_ID in .env file");
        return <div>Error: Missing app ID</div>;
    }
    return (
        <main className="flex w-full flex-col">
            <Call
                appId={process.env.NEXT_PUBLIC_AGORA_APP_ID!}
                channelName={channelName}
            />
        </main>
    );
}