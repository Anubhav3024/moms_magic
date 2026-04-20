import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { MenuItem } from "@/models";
import { getAdminSession } from "@/lib/adminSession";
import {
  asValidationMessage,
  menuItemUpsertSchema,
  objectIdSchema,
} from "@/lib/validation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = menuItemUpsertSchema.parse(await request.json());
    const { id } = await params;
    const validatedId = objectIdSchema.parse(id);
    const updatedItem = await MenuItem.findByIdAndUpdate(validatedId, body, {
      new: true,
    });
    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(updatedItem);
  } catch (error: unknown) {
    const message =
      asValidationMessage(error) ||
      (error instanceof Error ? error.message : "Update error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const validatedId = objectIdSchema.parse(id);
    const deletedItem = await MenuItem.findByIdAndDelete(validatedId);
    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error: unknown) {
    const message =
      asValidationMessage(error) ||
      (error instanceof Error ? error.message : "Delete error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
