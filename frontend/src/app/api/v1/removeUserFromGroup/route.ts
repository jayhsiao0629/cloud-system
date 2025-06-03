import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        const { user_id, group_id } = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group/${group_id}/user`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` // Assuming you have a token for authentication
            },
            body: JSON.stringify({ user_id: user_id }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to remove user from group");
        }

        return NextResponse.json({ user: data }, { status: 200 });
    } catch (error) {
        console.error("Error removing user from group:", error);
        return NextResponse.json({ error: "Failed to remove user from group." }, { status: 500 });
    }
}