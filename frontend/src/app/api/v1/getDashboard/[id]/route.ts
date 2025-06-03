import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  ctx: any
) {
  try {
    const gropu_id = (ctx.params as { id: string }).id; 

    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${gropu_id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching group users:", error);
    return NextResponse.json({ error: "Failed to fetch group users" }, { status: 500 });
  }
}