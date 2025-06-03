import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/${id}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await resp.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error creating skill: ", error);
        return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
    }
}