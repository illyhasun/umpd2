import { NextResponse } from "next/server";

import { connectDB } from "@/utils/db";
import { ShiftTemplate } from "@/models/ShiftTemplate";

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await connectDB()
        const templates = await ShiftTemplate.find()
        return NextResponse.json({ success: true, templates }, { status: 200 });
    } catch (err) {
        console.log('Chyba při načítání templatu z databáze', err);
        return NextResponse.json({ success: false, message: 'Chyba při načítání templatu z databáze' }, { status: 500 });
    }

}