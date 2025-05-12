import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const { channelName, resourceId, sid, uid } = await req.json();

    try {
        // Validate input
        if (!channelName || !resourceId || !sid || !uid) {
            console.error("Missing required parameters");
            return NextResponse.json(
                { success: false, error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Validate environment variables
        const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const AGORA_CUSTOMER_ID = process.env.NEXT_AGORA_CUSTOMER_ID;
        const AGORA_CUSTOMER_SECRET = process.env.NEXT_AGORA_CUSTOMER_SECRET;

        if (!AGORA_APP_ID || !AGORA_CUSTOMER_ID || !AGORA_CUSTOMER_SECRET) {
            console.error("Missing required environment variables");
            return NextResponse.json(
                { success: false, error: "Missing required environment variables" },
                { status: 500 }
            );
        }

        const authorization = Buffer.from(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`).toString("base64");

        // Step 1: Query recording status
        console.log("Querying recording status...");
        const queryResponse = await axios.get(
            `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/query`,
            {
                headers: {
                    Authorization: `Basic ${authorization}`,
                    "Content-Type": "application/json",
                },
            }
        ).catch((error) => {
            console.error("Query API Error:", error.response?.data || error.message);
            return null;
        });

        if (!queryResponse || queryResponse.data.status === undefined) {
            console.error("Recording session not found or already stopped");
            return NextResponse.json(
                { success: false, error: "Recording session not found or already stopped" },
                { status: 404 }
            );
        }

        console.log("Query Response:", queryResponse.data);

        // Step 2: Stop recording
        console.log("Stopping recording...");
        console.log(`https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`);

        const stopResponse = await axios.post(
            `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
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

        console.log("Stop Response:", stopResponse.data);

        return NextResponse.json({ success: true, data: stopResponse.data });
    } catch (error: any) {
        console.error("Stop API Error:", error.response?.data || error.message);
        return NextResponse.json(
            { success: false, error: error.response?.data || error.message },
            { status: 500 }
        );
    }
}