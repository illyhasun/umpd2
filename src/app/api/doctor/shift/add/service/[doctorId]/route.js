import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

function getNextDayDate(date) {
    let { day, month, year } = date
    let dayN = Number(day)
    let monthN = Number(month)
    let yearN = Number(year)

    const lastDayOfMonth = new Date(year, month, 0).getDate(); // Получаем последний день текущего месяца

    if (dayN + 1 > lastDayOfMonth) {
        dayN = 1;
        monthN += 1;
        if (monthN > 12) {
            monthN = 1;
            yearN += 1;
        }
    } else {
        dayN += 1;
    }

    return { day: dayN, month: monthN, year: yearN };
}

export async function PATCH(req, { params: { doctorId } }) {
    try {
        await connectDB();

        const { date, from, type, e } = await req.json(); // Новая смена с полями date, from и to
        const newFrom = Number(from)

        // Найти документ врача
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: 'Doctor not found' },
                { status: 404 }
            );
        }

        const shifts = e ? doctor.eShifts : doctor.shifts || []

        shifts.splice(0, shifts.length, ...shifts.filter(
            shift => !(
                (shift.date.year == date.year) &&
                (shift.date.month == date.month) &&
                ((shift.date.day == date.day && shift.to > newFrom) || (shift.date.day == Number(date.day) + 1))
            )
        ));


        if (newFrom < 11.5) {
            shifts.push({ date, from: newFrom, to: 11.5, type })
            shifts.push({ date, from: 12, to: 15.5, type })
            shifts.push({ date, from: 16, to: 24, type })
            shifts.push({ date: getNextDayDate(date), from: 0, to: newFrom + 1, type })
        }
        else if (newFrom < 15.5) {
            shifts.push({ date, from: newFrom, to: 15.5, type })
            shifts.push({ date, from: 16, to: 24, type })
            shifts.push({ date: getNextDayDate(date), from: 0, to: 11.5, type })
            shifts.push({ date: getNextDayDate(date), from: 12, to: newFrom + 1, type })
        } else {
            shifts.push({ date, from: newFrom, to: 24, type })
            shifts.push({ date: getNextDayDate(date), from: 0, to: 11.5, type })
            shifts.push({ date: getNextDayDate(date), from: 12, to: 15.5, type })
            shifts.push({ date: getNextDayDate(date), from: 16, to: newFrom + 1, type })
        }

        await doctor.save()

        doctor.shifts = doctor.shifts.filter(shift => shift.date.month == date.month && shift.date.year == date.year);
        doctor.eShifts = doctor.eShifts.filter(shift => shift.date.month == date.month && shift.date.year == date.year);

        return NextResponse.json(
            { success: true, message: 'Sluzba byla pridana uspesne', doctor },
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
