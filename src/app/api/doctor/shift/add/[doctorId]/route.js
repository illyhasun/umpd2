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
                Number(shift.date.day) === Number(date.day) &&
                Number(shift.date.month) === Number(date.month) &&
                Number(shift.date.year) === Number(date.year)
        );

        let mergedFrom = Number(newFrom);
        let mergedTo = Number(newTo);

        // Найти пересекающиеся смены
        const overlappingShifts = existingShifts.filter(shift => {
            const existingFrom = Number(shift.from);
            const existingTo = Number(shift.to);
            console.log(mergedFrom, '<=', existingTo, mergedTo, '>=', existingFrom)

            // return (
            //     (mergedFrom <= existingTo && mergedTo >= existingFrom) || // Пересечение
            //     (mergedTo === existingFrom) ||                           // Соприкасаются в начале
            //     (mergedFrom === existingTo)                              // Соприкасаются в конце
            // ); 
            
            return(
                (mergedFrom < existingTo && mergedTo > existingFrom)
            )
        });

        console.log('overlap', overlappingShifts)

        // Расширить границы смены, чтобы включить все пересекающиеся
        for (const shift of overlappingShifts) {
            mergedFrom = Math.min(mergedFrom, Number(shift.from));
            mergedTo = Math.max(mergedTo, Number(shift.to));
        }

        // Удалить все пересекающиеся смены из массива
        doctor.shifts = doctor.shifts.filter(shift => !overlappingShifts.includes(shift));

        // Добавить объединённую смену
        doctor.shifts.push({
            date,
            from: mergedFrom.toString(),
            to: mergedTo.toString(),
            type,
        });

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

