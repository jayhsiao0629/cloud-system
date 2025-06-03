import { NextResponse } from "next/server";

export async function DELETE (request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete group");
        }

        return NextResponse.json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting group:", error);
        return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
    }
}