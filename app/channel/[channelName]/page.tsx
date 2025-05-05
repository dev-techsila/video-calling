import Call from '../../../components/Call';

export default async function Page({ params }: { params: { channelName: string } }) {
    const { channelName } = await params;

    return (
        <main className="flex w-full flex-col">
            <Call appId={process.env.PUBLIC_AGORA_APP_ID!} channelName={channelName} />
        </main>
    );
}