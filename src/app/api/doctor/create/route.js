'use server'
import { NextResponse } from "next/server";

import { connectDB } from "@/utils/db";
import { Doctor } from "@/models/Doctor";


export async function POST(req) {
    try {
        await connectDB()

        const data = await req.json();
        const { personalNumber } = data

        if (personalNumber.length !== 4 || isNaN(Number(personalNumber))) {
            return NextResponse.json(
                { success: false, message: 'Osobní číslo musí obsahovat pouze 4 čísla' },
                { status: 400 });
        }

        const candidateDoctor = await Doctor.findOne({ personalNumber })

        if (candidateDoctor) {
            return NextResponse.json(
                { success: false, message: `Lékař s osobním číslem ${personalNumber} již existuje` },
                { status: 400 }
            );
        }

        const doctor = new Doctor(data)
        await doctor.save()

        return NextResponse.json(
            { success: true, message: `Údaje o lékaři ${personalNumber} byly přidány do databáze` },
            { status: 201 }
        );

    } catch (err) {
        console.log('Chyba při přidávání údajů lékaře', err);
        return NextResponse.json(
            { success: false, message: 'Chyba při přidávání údajů lékaře' },
            { status: 500 }
        );
    }
}