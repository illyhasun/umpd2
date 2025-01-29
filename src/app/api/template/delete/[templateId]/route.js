import { ShiftTemplate } from "@/models/ShiftTemplate";
import { connectDB } from "@/utils/db";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {
        await connectDB()
        const templateId = params.templateId
        await ShiftTemplate.findByIdAndDelete(templateId)
        return NextResponse.json({ success: true, message: 'Šablona byla úspěšně smazána'}, { status: 200 });
    } catch (err) {
        console.log('Chyba při smazávání šablony', err);
        return NextResponse.json({ success: false, error: 'Chyba při smazávání šablony' }, { status: 500 });
    }
}