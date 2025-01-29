import { NextResponse } from "next/server"

import { Doctor } from "@/models/Doctor"
import { connectDB } from "@/utils/db"

export async function GET() {
    try {
        await connectDB()
        const doctors = await Doctor.find().select('name personalNumber')
        return NextResponse.json({ success: true, doctors }, { status: 200 })
    } catch (err) {
        console.log('Chyba při načítání dat lekářů z databáze', err)
        return NextResponse.json(
            { success: false, message: 'Chyba při načítání dat lekářů z databáze' },
            { status: 500 }
        );
    }
}

