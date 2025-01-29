import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function PATCH(req, { params: { doctorId } }) {
    try {
        await connectDB();

        const shiftToDelete = await req.json();
        const { date, from: delFrom, to: delTo } = shiftToDelete;

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
                Number(shift.date.day) === Number(date.day) &&
                Number(shift.date.month) === Number(date.month) &&
                Number(shift.date.year) === Number(date.year)
        );


        let shiftUpdated = false;

        for (let i = 0; i < existingShifts.length; i++) {
            const shift = existingShifts[i];
            const existingFrom = parseFloat(shift.from);
            const existingTo = parseFloat(shift.to);

            // Проверка полного перекрытия
            if (delFrom <= existingFrom && delTo >= existingTo) {
                // Удаление всей смены, так как она полностью покрыта временем удаления
                doctor.shifts.splice(doctor.shifts.indexOf(shift), 1);
                shiftUpdated = true;
                continue; // Переход к следующей смене
            }

            // Проверка перекрытия в начале смены
            if (delFrom <= existingFrom && delTo > existingFrom && delTo < existingTo) {
                shift.from = delTo.toString();
                shiftUpdated = true;
                continue;
            }

            // Проверка перекрытия в конце смены
            if (delFrom > existingFrom && delFrom < existingTo && delTo >= existingTo) {
                shift.to = delFrom.toString();
                shiftUpdated = true;
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
                doctor.shifts.push(newShift); // Добавить новую смену
                shiftUpdated = true;
                continue;
            }
        }

        // Сохранение изменений, если обновления были
        if (shiftUpdated) {
            await doctor.save();
        }

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
