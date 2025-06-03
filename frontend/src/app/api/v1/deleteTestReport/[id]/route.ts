import {NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/report/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return new Response(null, { status: 204 }); // No content
    } catch (error) {
        console.error("Error deleting device:", error);
        return NextResponse.json({ error: "Failed to delete device" }, { status: 500 });
    }
}