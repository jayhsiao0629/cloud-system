export async function PUT(request: Request, ctx: any) {
    try {
        const id = (ctx.params as { id: string }).id; 
        const body = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("Error updating user:", error);
        return new Response(JSON.stringify({ error: "Failed to update user" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}