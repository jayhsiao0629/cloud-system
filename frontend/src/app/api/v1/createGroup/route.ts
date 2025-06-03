import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("Failed to create group");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}