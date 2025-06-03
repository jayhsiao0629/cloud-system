import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete test');
        }

        return NextResponse.json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error('Error deleting test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}