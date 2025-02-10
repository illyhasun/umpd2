import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function PATCH(req, { params: { doctorId, month, year } }) {
    try {
        await connectDB();

        // Найти документ врача
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: 'Doctor not found' },
                { status: 404 }
            );
        }

        // Проверяем, есть ли у врача смены в указанном месяце
        const hasEShifts = doctor.eShifts.some((shift) => shift.date.month == month && shift.date.year == year);

        if (hasEShifts) {
            return NextResponse.json(
                { success: false, message: "Aby nakopirovat skutecne smeny museji evidecni smeny byt prazdne" },
                { status: 400 }
            );
        }

        const filteredShifts = doctor.shifts.filter(shift => shift.date.month == month && shift.date.year == year);
        doctor.eShifts = filteredShifts

        await doctor.save();

        return NextResponse.json(
            { success: true, message: 'Smeny byli uspesne zkopirovane', doctor },
            { status: 200 }
        );

    } catch (err) {
        console.log('Error updating doctor data in the database', err);
        return NextResponse.json(
            { success: false, error: 'Error updating doctor data' },
            { status: 500 }
        );
    }
}
