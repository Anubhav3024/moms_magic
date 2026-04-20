import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Employee } from "@/models";
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
    const updatedEmployee = await Employee.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!updatedEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(updatedEmployee);
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
    const deletedEmployee = await Employee.findByIdAndDelete(params.id);
    if (!deletedEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "Employee deleted magic!" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
