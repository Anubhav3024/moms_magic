import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { MenuItem } from "@/models";
import { getAdminSession } from "@/lib/adminSession";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const updatedItem = await MenuItem.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(updatedItem);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deletedItem = await MenuItem.findByIdAndDelete(params.id);
    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
