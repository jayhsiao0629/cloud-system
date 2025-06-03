import { NextResponse } from "next/server";

export async function GET() {
    try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/device`, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await resp.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.error("Error fetching devices : ", error);
    }
}