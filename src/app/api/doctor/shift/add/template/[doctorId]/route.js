import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

import { ShiftTemplate } from "@/models/ShiftTemplate";
export async function PATCH(req) {
    try {
        await connectDB();

        const { doctorId, templateId, month, year } = await req.json();

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

        // Находим шаблон
        const template = await ShiftTemplate.findById(templateId);
        if (!template) {
            return NextResponse.json(
                { success: false, message: "Template not found" },
                { status: 404 }
            );
        }

        // Получаем дни месяца
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
                        type: "o", // Тип смены
                    });
                    newShifts.push({
                        date: { day, month, year },
                        from: (shiftSettings.pause + 0.5).toString(), // Пауза + 30 минут
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
        for (const newShift of newShifts) {
            const existingShifts = doctor.shifts.filter(
                shift =>
                    Number(shift.date.day) === Number(newShift.date.day) &&
                    Number(shift.date.month) === Number(newShift.date.month) &&
                    Number(shift.date.year) === Number(newShift.date.year)
            );

            let merged = false;

            for (let shift of existingShifts) {
                const existingFrom = parseFloat(shift.from);
                const existingTo = parseFloat(shift.to);

                // Проверка на пересечение или соприкосновение
                if (
                    (parseFloat(newShift.from) <= existingTo && parseFloat(newShift.to) >= existingFrom) ||
                    parseFloat(newShift.to) === existingFrom ||
                    parseFloat(newShift.from) === existingTo
                ) {
                    // Объединяем смены
                    shift.from = Math.min(existingFrom, parseFloat(newShift.from)).toString();
                    shift.to = Math.max(existingTo, parseFloat(newShift.to)).toString();
                    merged = true;
                    break;
                }
            }

            if (!merged) {
                // Если пересечений нет, добавляем новую смену
                doctor.shifts.push(newShift);
            }
        }

        // Сохраняем изменения
        await doctor.save();

        return NextResponse.json(
            { success: true, message: "Shifts added successfully" },
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
