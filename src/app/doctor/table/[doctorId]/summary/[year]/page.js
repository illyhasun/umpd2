'use client'
import { useHttp } from "@/hooks/useHttpHook";
import { useState, useEffect } from "react";
import classes from './page.module.css'
import { calculatePartTimeNorm, getCzechHolidays, getDaysInMonth, getRelevantItem } from "@/utils/tables";
import Info from "./components/info";
import Table from "./components/table";

export default function YearSummary({ params: { doctorId, year } }) {
    const { req, loading, error, message } = useHttp();
    const [doctor, setDoctor] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);

    const holidays = getCzechHolidays(year);

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const response = await req(`/api/doctor/getById/${doctorId}/shiftsByYear/${year}`, 'GET');
                setDoctor(response.doctor);
            } catch (err) {
                console.error(err);
            }
        };

        fetchDoctorData();
    }, [doctorId, req]);

    function calculateMonthlyWorkedHours(month) {

        const workingTime = getRelevantItem(doctor?.workingTime, month, year)

        if (!doctor || !doctor.shifts) return null;

        const filteredShifts = doctor.shifts.filter(shift => {
            return shift.date.year == year && shift.date.month === month;
        });

        const days = getDaysInMonth(holidays, month, year);

        const NIGHT_START = 22; // 10 PM
        const NIGHT_END = 6;   // 6 AM

        let totalHours = 0
        let weekendHours = 0
        let nightHours = 0
        let holidayHours = 0;
        let normPartTimeHours = 0
        let normHolidayHours = 0
        let off = 0
        let h = 0


        const workdays = days.filter(day => !day.isWeekend);
        const normHours = workdays.length * 8;


        if (workingTime?.timeName === '2') {
            const normHours = calculatePartTimeNorm(workingTime.workingDays, days)
            normHolidayHours = normHours.totalHolidayHours
            normPartTimeHours = normHours.totalHours

        } else {
            normHolidayHours = holidays.filter(holiday =>
                workdays.some(workday => workday.formattedDate === holiday)
            ).length * 8;
        }

        filteredShifts.forEach(shift => {
            const { date, from, to, type } = shift;
            const shiftDate = new Date(`${date.month}/${date.day}/${date.year}`);
            const dayOfWeek = shiftDate.getDay();
            const formattedDate = `${date.day}/${date.month}/${year}`;

            let hours = to - from;


            if (type === 'd') {
                off += hours;
            }
            if (type === 'h') {
                h += hours
            }

            if (holidays.includes(formattedDate)) {
                holidayHours += hours;
            }

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                weekendHours += hours;
            }

            for (let hour = from; hour < to; hour += 0.5) {
                const roundedHour = hour % 24;
                if (roundedHour >= NIGHT_START || roundedHour < NIGHT_END) {
                    nightHours += 0.5;
                }
            }

            totalHours += hours;
        });

        totalHours += normHolidayHours;

        const overtimeHours = Math.max(0, totalHours - normHours);
        const overtimeWorkDay = overtimeHours - Math.min(overtimeHours, weekendHours)
        const overtimeWeekend = Math.min(overtimeHours, weekendHours)

        const overtimePartTime = Math.max(totalHours - normPartTimeHours, 0)

        return { totalHours, weekendHours, holidayHours, nightHours, overtimeHours, overtimeWorkDay, overtimeWeekend, overtimePartTime, normHours, normPartTimeHours, normHolidayHours, off, h }
    }

    useEffect(() => {
        const data = [];
        for (let month = 1; month <= 12; month++) {
            const monthData = calculateMonthlyWorkedHours(month);
            if (monthData) data.push(monthData);
        }
        setMonthlyData(data);
    }, [doctor, year]);

    return (
        <div className={classes.yearlyReport}>
            <Info doctor={doctor} year={year}/>
            <Table monthlyData={monthlyData} doctorId={doctorId} year={year}/>
        </div>
    );
}
