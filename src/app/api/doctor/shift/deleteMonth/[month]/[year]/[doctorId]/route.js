import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function PATCH(req, { params: { doctorId, year, month } }) {
    try {
        await connectDB();

        const { e } = await req.json();

        // Преобразуем year и month из строки в число
        const targetYear = parseInt(year, 10);
        const targetMonth = parseInt(month, 10);

        // Проверка корректности параметров
        if (isNaN(targetYear) || isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
            return NextResponse.json(
                { success: false, message: "Invalid year or month" },
                { status: 400 }
            );
        }

        // Найти документ врача
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: "Doctor not found" },
                { status: 404 }
            );
        }
        const shifts = e ? doctor.eShifts : doctor.shifts || []


        // Удалить все смены за указанный месяц и год
        shifts.splice(0, shifts.length, ...shifts.filter(
            shift => !(Number(shift.date.year) === targetYear && Number(shift.date.month) === targetMonth)
        ));

        await doctor.save();
        return NextResponse.json({ success: true, message: 'směny byli smazany', }, { status: 200 });
    } catch (err) {
        console.error("Error deleting shifts for the month", err);
        return NextResponse.json(
            { success: false, error: "Error deleting shifts for the month" },
            { status: 500 }
        );
    }
}
