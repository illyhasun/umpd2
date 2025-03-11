import { NextResponse } from "next/server";

import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";
import { getCurrentDateFormatted } from "@/utils/date";

export async function PATCH(req, { params: { doctorId } }) {
    try {
        await connectDB();
        const data = await req.json();
        await Doctor.findByIdAndUpdate(doctorId, data)
        return NextResponse.json({ success: true, message: `Údaje o lékaři byly změněny` }, { status: 200 });
    } catch (err) {
        console.log('Помилка при оновленні данних працівника до бази данних', err);
        return NextResponse.json({ success: false, error: 'Помилка при оновленні данних працівника' }, { status: 500 });
    }
}
