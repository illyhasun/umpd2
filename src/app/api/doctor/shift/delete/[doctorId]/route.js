import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function PATCH(req, { params: { doctorId } }) {
    try {
        await connectDB();

        const shiftToDelete = await req.json();
        const { date, from: delFrom, to: delTo, e } = shiftToDelete;

        // Найти документ врача
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: 'Doctor not found' },
                { status: 404 }
            );
        }
        const shifts = e ? doctor.eShifts : doctor.shifts || []

        // Найти все смены на ту же дату
        const existingShifts = shifts.filter(
            shift =>
                shift.date.day == date.day &&
                shift.date.month == date.month &&
                shift.date.year == date.year
        );



        for (let i = 0; i < existingShifts.length; i++) {
            const shift = existingShifts[i];
            const existingFrom = parseFloat(shift.from);
            const existingTo = parseFloat(shift.to);

            // Проверка полного перекрытия
            if (delFrom <= existingFrom && delTo >= existingTo) {
                // Удаление всей смены, так как она полностью покрыта временем удаления
                shifts.splice(shifts.indexOf(shift), 1);
                continue; // Переход к следующей смене
            }

            // Проверка перекрытия в начале смены
            if (delFrom <= existingFrom && delTo > existingFrom && delTo < existingTo) {
                shift.from = delTo.toString();
                continue;
            }

            // Проверка перекрытия в конце смены
            if (delFrom > existingFrom && delFrom < existingTo && delTo >= existingTo) {
                shift.to = delFrom.toString();
                continue;
            }

            // Проверка перекрытия в середине смены
            if (delFrom > existingFrom && delTo < existingTo) {
                // Разделить смену на две части
                const newShift = {
                    date: shift.date,
                    from: delTo.toString(),
                    to: shift.to,
                    type: shift.type // Сохраняем тип оригинальной смены
                };
                shift.to = delFrom.toString(); // Обновить конец текущей смены
                shifts.push(newShift); // Добавить новую смену
                continue;
            }
        }

        // Сохранение изменений, если обновления были
        await doctor.save();

        return NextResponse.json(
            { success: true, message: `Shift(s) updated or removed successfully.` },
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
