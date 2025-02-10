import { NextResponse } from "next/server";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "@/utils/db";
import Papa from 'papaparse';  // Импортируем папу для парсинга CSV

function processCSV(data) {
    const rows = data.slice(4, 35);  // Извлекаем строки с 4 по 35 (индексация с 0)
    const result = rows.map((row) => {
        return row.slice(0, 50);  // Извлекаем только первые 50 столбцов
    });
    return result;
}

export async function PATCH(req, { params: { doctorId } }) {
    try {
        await connectDB();

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { success: false, message: "Doctor not found" },
                { status: 404 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file'); // Здесь 'file' - это название поля формы

        if (!file || file.type !== 'text/csv') {
            return NextResponse.json({ success: false, message: 'No file provided' },
                { status: 400 });
        }

        const text = await file.text();

        // Парсим CSV файл с использованием библиотеки PapaParse
        const { data, errors } = Papa.parse(text, {
            dynamicTyping: true,
            header: false,  // Без заголовков, если их нет
        });

        if (errors.length > 0) {
            return NextResponse.json(
                { success: false, message: 'csv parse error' },
                { status: 400 }
            );
        }

        // Применяем процессинг (первые 50 столбцов и строки с 4 по 35)
        const processedData = processCSV(data);

        const result = [];


        processedData.forEach(day => {
            const [dayName, dateRaw, ...values] = day;
            const [dayOfMonth, month, year] = dateRaw.split("/").map(Number);

            let from = null;
            let currentType = null;


            console.log(values)

            values.forEach((value, index) => {

                if (value && from === null) {
                    // Начало новой последовательности
                    from = index / 2;
                    currentType = value;
                }
                if ((value !== currentType || value === null || index === values.length - 1) && from !== null) {
                    // Конец последовательности
                    const to = index === values.length - 1 ? (index + 1) / 2 : index / 2;
                    doctor.shifts.push({
                        date: { day: dayOfMonth, month, year },
                        from: from.toString(),
                        to: to.toString(),
                        type: currentType.toLowerCase()
                    });

                    from = null;
                    currentType = null;
                }
            });
        });

        await doctor.save();
        doctor.shifts = doctor.shifts.filter(shift => shift.date.month == date.month && shift.date.year == date.year);
        doctor.eShifts = doctor.eShifts.filter(shift => shift.date.month == date.month && shift.date.year == date.year);

        // Возвращаем обработанные данные в виде JSON
        return NextResponse.json(
            { success: true, message: 'sablona byla uspesne pridana', doctor },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error processing CSV:", error);
        return NextResponse.json(
            { success: false, message: 'Error processing CSV file' },
            { status: 500 }
        );
    }
}
