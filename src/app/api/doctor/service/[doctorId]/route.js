import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";

export async function PATCH(req, {params: {doctorId}}) {
    try {
        await connectDB();

        const { month, year, count } = await req.json();

        if (!doctorId || !month || !year || typeof count !== 'number') {
            return NextResponse.json(
                { success: false, message: "Invalid input data" },
                { status: 400 }
            );
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: "Doctor not found" },
                { status: 404 }
            );
        }

        const existingService = doctor.services.find(
            service => service.month === Number(month) && service.year === Number(year)
        );


        if (existingService) {
            existingService.count = count;
        } else {
            doctor.services.push({ month, year, count });
            console.log(doctor.services)
        }

        await doctor.save();

        return NextResponse.json(
            { success: true, message: "Service count was changed successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error :", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}