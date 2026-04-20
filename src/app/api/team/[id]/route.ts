import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Employee } from "@/models";
import { getAdminSession } from "@/lib/adminSession";
import {
  asValidationMessage,
  employeeUpsertSchema,
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
    const body = employeeUpsertSchema.parse(await request.json());
    const { id } = await params;
    const validatedId = objectIdSchema.parse(id);
    const updatedEmployee = await Employee.findByIdAndUpdate(
      validatedId,
      body,
      {
        new: true,
      },
    );
    if (!updatedEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(updatedEmployee);
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
    const deletedEmployee = await Employee.findByIdAndDelete(validatedId);
    if (!deletedEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "Employee deleted magic!" });
  } catch (error: unknown) {
    const message =
      asValidationMessage(error) ||
      (error instanceof Error ? error.message : "Delete error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
