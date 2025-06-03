import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
        });
    
        if (!response.ok) {
        throw new Error("Failed to fetch groups");
        }
    
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
    }
}