import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, ctx: any){
  const id = (ctx.params as { id: string }).id; 

  const body = await req.json();
  const userId = body.selectedUser[0];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/${id}/user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "user_id": userId }),
    });

    console.log(await response.json());

    if (!response.ok) {
      throw new Error("Failed to assign user test");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching group users:", error);
    return NextResponse.json({ error: "Failed to fetch group users" }, { status: 500 });
  }
}