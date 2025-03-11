import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function PATCH(req, { params: { doctorId } }) {
    try {
        await connectDB();

        const newShift = await req.json()
        const { date, from: newFrom, to: newTo, e } = newShift

        const doctor = await Doctor.findById(doctorId)
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: 'Doctor not found' },
                { status: 404 }
            );
        }

        const shifts = e ? doctor.eShifts : doctor.shifts || []
        const existingShifts = shifts.filter(
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

        const newShifts = []

        for (const shift of overlappingShifts) {
            if (shift.to <= newFrom || shift.from >= newTo) {
                newShifts.push(shift);
            } else {
                if (shift.from < newFrom) {
                    newShifts.push({ date, from: shift.from, to: newFrom, type: shift.type })
                }
                if (shift.to > newShift.to) {
                    newShifts.push({ date, from: newTo, to: shift.to, type: shift.type })
                }
            }
        }

        newShifts.push(newShift);
        newShifts.sort((a, b) => a.from - b.from)

        const mergedShifts = newShifts.reduce((acc, shift) => {
            const lastShift = acc[acc.length - 1]

            if (lastShift && lastShift.type == shift.type && lastShift.to == shift.from) {
                lastShift.to = shift.to;
            } else {
                acc.push(shift);
            }

            return acc;
        }, []);

        shifts.splice(0, shifts.length, ...shifts.filter(
            shift => !overlappingShifts.some(
                s => s.from == shift.from && s.to == shift.to && s.date.day == shift.date.day
            )
        ))


        shifts.push(...mergedShifts)

        await doctor.save()

        doctor.shifts = doctor.shifts.filter(shift => shift.date.month == date.month && shift.date.year == date.year)
        doctor.eShifts = doctor.eShifts.filter(shift => shift.date.month == date.month && shift.date.year == date.year)

        return NextResponse.json(
            { success: true, message: 'Shift added or merged successfully.', doctor },
            { status: 200 }
        );

    } catch (err) {
        console.log('Error updating doctor data in the database', err)
        return NextResponse.json(
            { success: false, error: 'Error updating doctor data' },
            { status: 500 }
        );
    }
}
