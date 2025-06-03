import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        const { id } = await context.params;
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` // Assuming you have a token for authentication
            },
        });

        const data = await resp.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error fetching users: ", error);
    }
}