import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function PATCH(req, { params: { doctorId } }) {
    try {
        await connectDB();

        const newShift = await req.json(); // Новая смена с полями date, from и to
        const { date, from: newFrom, to: newTo, type } = newShift;

        // Найти документ врача
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: 'Doctor not found' },
                { status: 404 }
            );
        }

        // Найти все смены на ту же дату
        const existingShifts = doctor.shifts.filter(
            shift =>
                shift.date.day == date.day &&
                shift.date.month == date.month &&
                shift.date.year == date.year
        );

        const overlappingShifts = existingShifts.filter(shift => {
            const existingFrom = Number(shift.from);
            const existingTo = Number(shift.to);

            return (
                (Number(newFrom) <= existingTo && Number(newTo) >= existingFrom)
            )
        });
        // new shift 10-20
        //old shifts 8-12 14-16 18-21

        const newShifts = []

        for (const shift of overlappingShifts) {
            if (shift.to <= newFrom || shift.from >= newTo) {
                newShifts.push(shift);
            } else {
                if (shift.from < newFrom) {
                    newShifts.push({ date, from: shift.from, to: newFrom, type: shift.type });
                }
                if (shift.to > newShift.to) {
                    newShifts.push({ date, from: newTo, to: shift.to, type: shift.type });
                }
            }
        }

        newShifts.push(newShift);
        newShifts.sort((a, b) => a.from - b.from);

        const mergedShifts = newShifts.reduce((acc, shift) => {
            const lastShift = acc[acc.length - 1];

            if (lastShift && lastShift.type === shift.type && lastShift.to === shift.from) {
                // Если смена того же типа и стыкуется, объединяем её с предыдущей
                lastShift.to = shift.to;
            } else {
                // Иначе добавляем новую запись
                acc.push(shift);
            }

            return acc;
        }, []);

        doctor.shifts = doctor.shifts.filter(
            shift => !overlappingShifts.some(
                s => s.from === shift.from && s.to === shift.to && s.date.day === shift.date.day
            )
        );

        doctor.shifts.push(...mergedShifts);

        // Сохранить обновленный документ
        await doctor.save();

        return NextResponse.json(
            { success: true, message: 'Shift added or merged successfully.' },
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
