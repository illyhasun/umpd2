import { NextResponse } from "next/server";

import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function GET(req, { params }) {
    try {
        await connectDB()
        const doctorPn = params.doctorPn
        if (!params || !params.doctorPn || params.doctorPn.length !== 4 || isNaN(Number(doctorPn))) {
            return NextResponse.json({ success: false, message: 'Nesprávné osobní číslo' }, { status: 400 });
        }
        const doctor = await Doctor.find({ personalNumber: doctorPn }).select('name personalNumber')
        console.log(doctor)
        if (!doctor || !doctor[0]) {
            return NextResponse.json({ success: false, message: `Lékař s osobním číslem ${doctorPn} nebyl nalezen` }, { status: 400 });
        }
        return NextResponse.json({ success: true, doctor }, { status: 200 });
    } catch (err) {
        console.log('Chyba při načítání dat lekáře podle osobního čísla z databáze', err);
        return NextResponse.json({ success: false, message: 'Chyba při načítání dat lekáře podle osobního čísla z databáze' }, { status: 500 });
    }

}
