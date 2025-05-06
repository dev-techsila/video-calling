import Call from '../../../components/Call';

export default function Page({
    params
}: {
    params: { channelName: string }
}) {
    return (
        <main className="flex w-full flex-col">
            <Call
                appId={process.env.NEXT_PUBLIC_AGORA_APP_ID!}
                channelName={params.channelName}
            />
        </main>
    );
}