import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";
import { ShiftTemplate } from "@/models/ShiftTemplate";

export async function PATCH(req) {
    try {
        await connectDB();

        const { doctorId, templateId, month, year, e } = await req.json();

        // Проверяем, что все данные переданы
        if (!doctorId || !templateId || !month || !year) {
            return NextResponse.json(
                { success: false, message: "Invalid input data" },
                { status: 400 }
            );
        }

        // Находим врача
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: "Doctor not found" },
                { status: 404 }
            );
        }

        const shifts = e ? doctor.eShifts : doctor.shifts

        // Проверяем, есть ли у врача смены в указанном месяце
        const hasShifts = shifts.some(
            (shift) => Number(shift.date.month) === Number(month) && Number(shift.date.year) === Number(year)
        );

        if (hasShifts) {
            return NextResponse.json(
                { success: false, message: "Shifts already exist for this month" },
                { status: 400 }
            );
        }

        // Находим шаблон
        const template = await ShiftTemplate.findById(templateId);
        if (!template) {
            return NextResponse.json(
                { success: false, message: "Template not found" },
                { status: 404 }
            );
        }

        // Получаем количество дней в месяце
        const daysInMonth = new Date(year, month, 0).getDate();

        // Маппим дни недели из шаблона
        const dayOfWeekMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const newShifts = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = dayOfWeekMap[date.getDay()];

            // Получаем настройки смены для текущего дня недели
            const shiftSettings = template[dayOfWeek];
            if (shiftSettings && shiftSettings.from !== null && shiftSettings.to !== null) {
                if (shiftSettings.pause) {
                    // Если есть пауза, добавляем две смены
                    newShifts.push({
                        date: { day, month, year },
                        from: shiftSettings.from.toString(),
                        to: shiftSettings.pause.toString(),
                        type: "o",
                    });
                    newShifts.push({
                        date: { day, month, year },
                        from: (shiftSettings.pause + 0.5).toString(),
                        to: shiftSettings.to.toString(),
                        type: "o",
                    });
                } else {
                    // Если паузы нет, добавляем одну смену
                    newShifts.push({
                        date: { day, month, year },
                        from: shiftSettings.from.toString(),
                        to: shiftSettings.to.toString(),
                        type: "o",
                    });
                }
            }
        }

        // Добавляем смены врачу
        shifts.push(...newShifts);

        // Сохраняем изменения
        await doctor.save();

        doctor.shifts = doctor.shifts.filter(shift => shift.date.month == month && shift.date.year == year);
        doctor.eShifts = doctor.eShifts.filter(shift => shift.date.month == month && shift.date.year == year);

        return NextResponse.json(
            { success: true, message: "Shifts added successfully", doctor },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error applying template:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
