import { NextResponse } from "next/server";

export async function GET() {
    try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skill`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await resp.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error fetching users: ", error);
    }
}