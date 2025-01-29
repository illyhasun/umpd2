import { NextResponse } from "next/server";

import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function GET(req, { params }) {
    try {
        await connectDB()
        const doctorId = params.doctorId
        if (!params || !params.doctorId) {
            return NextResponse.json({ success: false, message: 'Nesprávné ID lékaře' }, { status: 400 });
        }
        const doctor = await Doctor.findById(doctorId)
        return NextResponse.json({ success: true, doctor }, { status: 200 });
    } catch (err) {
        console.log('Chyba při načítání dat lekáře podle ID z databáze', err);
        return NextResponse.json({ success: false, message: 'Chyba při načítání dat lekáře podle ID z databáze' }, { status: 500 });
    }

}