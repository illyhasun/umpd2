import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { doctorId, month, year } = params;

        if (!doctorId) {
            return NextResponse.json({ success: false, message: "Nesprávné ID lékaře" }, { status: 400 });
        }

        if (!month || !year) {
            return NextResponse.json({ success: false, message: "Musíte zadat měsíc a rok" }, { status: 400 });
        }

        const monthNum = Number(month);
        const yearNum = Number(year);

        // Преобразуем doctorId в ObjectId
        const objectId = new mongoose.Types.ObjectId(doctorId);

        const doctor = await Doctor.aggregate([
            { $match: { _id: objectId } }, // Фикс: теперь doctorId — ObjectId
            {
                $project: {
                    _id: 1,
                    name: 1,
                    personalNumber: 1,
                    workingMode: 1,
                    workingTime: 1,
                    shifts: {
                        $filter: {
                            input: "$shifts",
                            as: "shift",
                            cond: {
                                $and: [
                                    { $eq: ["$$shift.date.month", monthNum] },
                                    { $eq: ["$$shift.date.year", yearNum] }
                                ]
                            }
                        }
                    },
                    eShifts: {
                        $filter: {
                            input: "$eShifts",
                            as: "eshift",
                            cond: {
                                $and: [
                                    { $eq: ["$$eshift.date.month", monthNum] },
                                    { $eq: ["$$eshift.date.year", yearNum] }
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        if (!doctor.length) {
            return NextResponse.json({ success: false, message: "Lékař nenalezen" }, { status: 404 });
        }

        return NextResponse.json({ success: true, doctor: doctor[0] }, { status: 200 });

    } catch (err) {
        console.error("Chyba při načítání dat lékaře podle ID z databáze", err);
        return NextResponse.json(
            { success: false, message: "Chyba při načítání dat lékaře" },
            { status: 500 }
        );
    }
}
