import { NextResponse } from "next/server";

export async function GET() {
    try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` // Assuming you have a token for authentication
            },
        });

        const data = await resp.json();
        console.log(data);
        // console.log(data.users[0].role.name);
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error fetching users: ", error);
    }
}