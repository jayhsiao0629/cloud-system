import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
    const { id } = await context.params;
    const body = await request.json();
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        });
    
        if (!response.ok) {
        throw new Error('Failed to update test');
        }
    
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}