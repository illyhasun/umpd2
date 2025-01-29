'use server'
import { NextResponse } from "next/server";

import { connectDB } from "@/utils/db";
import { ShiftTemplate } from "@/models/ShiftTemplate";


export async function POST(req) {
    try {
        await connectDB()

        const data = await req.json();
        const { name } = data

        if (!name) {
            return NextResponse.json({ success: false, message: 'template musí mít název' }, { status: 400 });
        }

        const isNameExist = await ShiftTemplate.findOne({ name })

        if (isNameExist) {
            return NextResponse.json({ success: false, message: `template s názvem ${name} již existuje` }, { status: 400 });
        }


        const template = new ShiftTemplate(data)

        console.log(template)

        await template.save()

        return NextResponse.json(
            { success: true, message: `template ${name} byl přidán do databáze` },
            { status: 201 }
        );

    } catch (err) {
        console.log('Chyba při přidávání templatu', err);
        return NextResponse.json({ success: false, message: 'Chyba při přidávání templatu' }, { status: 500 });
    }
}