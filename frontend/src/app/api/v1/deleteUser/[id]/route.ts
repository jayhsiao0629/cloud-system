import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest, ctx: any) {
    const id = (ctx.params as { id: string }).id; 
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` // Assuming you have a token for authentication
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return new Response(null, { status: 204 }); // No content
    } catch (error) {
        console.error("Error deleting user:", error);
        return new Response("Failed to delete user", { status: 500 });
    }
}