import { NextResponse } from "next/server";

export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group/${body.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("Failed to update group");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating group:", error);
        return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
    }
}