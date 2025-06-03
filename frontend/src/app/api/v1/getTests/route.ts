import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        });
    
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching tests:", error);
        return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
    }
}