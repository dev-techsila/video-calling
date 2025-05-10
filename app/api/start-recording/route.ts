import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const { channelName, uid } = await req.json();

    try {
        const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
        const AGORA_APP_CERTIFICATE = process.env.NEXT_AGORA_APP_CERTIFICATE!;
        const AGORA_CUSTOMER_ID = process.env.NEXT_AGORA_CUSTOMER_ID!;
        const AGORA_CUSTOMER_SECRET = process.env.NEXT_AGORA_CUSTOMER_SECRET!;

        console.log(AGORA_APP_ID);
        console.log(AGORA_APP_CERTIFICATE);
        console.log(AGORA_CUSTOMER_ID);
        console.log(AGORA_CUSTOMER_SECRET);



        const authorization = Buffer.from(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`).toString('base64');

        // Step 1: Acquire Resource ID
        const acquireResponse = await axios.post(
            `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/acquire`,
            {
                cname: channelName,
                uid: String(uid),
                clientRequest: {},
            },
            {
                headers: {
                    Authorization: `Basic ${authorization}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const resourceId = acquireResponse.data.resourceId;

        console.log(resourceId);
        console.log("auth", authorization)
        console.log(`https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`);


        // Step 2: Start Recording
        const startResponse = await axios.post(
            `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`,
            {
                cname: channelName,
                uid: String(uid),
                clientRequest: {
                    recordingConfig: {
                        maxIdleTime: 30,
                        streamTypes: 2,
                        audioProfile: 1,
                        channelType: 0,
                        videoStreamType: 0,
                    },
                    storageConfig: {
                        vendor: 1, // 1: Amazon S3
                        region: 3, // S3 region
                        bucket: process.env.NEXT_AWS_S3_BUCKET_NAME!,
                        accessKey: process.env.NEXT_AWS_S3_ACCESS_KEY!,
                        secretKey: process.env.NEXT_AWS_S3_SECRET_KEY!,
                        fileNamePrefix: ["recordings"],
                    },
                },
            },
            {
                headers: {
                    Authorization: `Basic ${authorization}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("StartResponse", startResponse.data)

        return NextResponse.json({ success: true, resourceId, sid: startResponse.data.sid });
    } catch (error: any) {
        console.error(error.response);
        return NextResponse.json({ success: false, error: error }, { status: 500 });
    }
}