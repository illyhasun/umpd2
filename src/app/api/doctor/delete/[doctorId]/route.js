import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {
        await connectDB()
        const doctorId = params.doctorId
        await Doctor.findByIdAndDelete(doctorId)
        return NextResponse.json({ success: true, message: 'Údaje o doktorovi byly úspěšně smazány'}, { status: 200 });
    } catch (err) {
        console.log('Chyba při smazávání doktora', err);
        return NextResponse.json({ success: false, error: 'Chyba při smazávání doktora' }, { status: 500 });
    }

}