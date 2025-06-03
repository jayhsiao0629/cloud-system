import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/device/type`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.error("Error fetching device types:", error);
        return NextResponse.json({ error: "Failed to fetch device types" }, { status: 500 });
    }
}