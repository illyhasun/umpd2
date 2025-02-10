'use client'
import { useHttp } from "@/hooks/useHttpHook";
import { useState, useEffect } from "react";
import classes from './page.module.css'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCzechHolidays, getDaysInMonth, getRelevantItem } from "@/utils/tables";

export default function YearSummary({ params: { doctorId, year } }) {
    const { req, loading, error } = useHttp();
    const [doctor, setDoctor] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);

    const router = useRouter()

    const currentYear = new Date().getFullYear();
    const workingModeYears = doctor?.workingMode.map(mode => mode?.validFrom.year);
    const minYear = workingModeYears ? Math.min(...workingModeYears) : 2024;

    const yearsArray = [];
    for (let year = minYear - 1; year <= currentYear + 1; year++) {
        yearsArray.push(year);
    }

    const holidays = getCzechHolidays(year);
    

    function calculatePartTimeNorm(hoursArray, days) {

        let totalHours = 0
        let totalHolidayHours = 0

        console.log(hoursArray)

        for (const day of days) {
            // `currentDate.getDay()` returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
            const dayIndex = day.dayOfWeek === 'PO' ? 0 :
                day.dayOfWeek === 'ÚT' ? 1 :
                    day.dayOfWeek === 'ST' ? 2 :
                        day.dayOfWeek === 'ČT' ? 3 :
                            day.dayOfWeek === 'PÁ' ? 4 :
                                day.dayOfWeek === 'SO' ? 5 :
                                    day.dayOfWeek === 'NE' ? 6 : -1;

            if (dayIndex === -1) {
                console.log(`Unrecognized day of the week: ${day.dayOfWeek}`);
            }

            totalHours += hoursArray[dayIndex];
            if (day.isHoliday) {
                totalHolidayHours += hoursArray[dayIndex]
            }
        }

        return { totalHours, totalHolidayHours };
    }

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
            return shift.date.year === Number(year) && shift.date.month === month;
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
            console.log(normHours)

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
            if(type === 'h'){
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

    const totals = monthlyData.reduce(
        (acc, data) => {
            if (!data) return acc;
            acc.totalHours += data.totalHours;
            acc.holidayHours += data.holidayHours;
            acc.weekendHours += data.weekendHours;
            acc.nightHours += data.nightHours;
            acc.overtimeHours += data.overtimeHours;
            acc.overtimeWorkDay += data.overtimeWorkDay;
            acc.overtimeWeekend += data.overtimeWeekend;
            acc.overtimePartTime += data.overtimePartTime
            acc.normHolidayHours += data.normHolidayHours
            acc.normHours += data.normHours
            acc.normPartTimeHours += data.normPartTimeHours
            acc.off += data.off
            acc.h += data.h
            return acc;
        },
        {
            totalHours: 0,
            holidayHours: 0,
            weekendHours: 0,
            nightHours: 0,
            overtimeHours: 0,
            overtimeWorkDay: 0,
            overtimeWeekend: 0,
            overtimePartTime: 0,
            normHolidayHours: 0,
            rushWeekend: 0,
            normHours: 0,
            normPartTimeHours: 0,
            off: 0,
            h: 0
        }
    );

    if (error) return <h1>Error: {error}</h1>;

    return (

        <div className={classes.yearlyReport}>
            <div className={classes.info}>
                <div className={classes.doctorInfo}>
                    <h1>{doctor?.name}</h1>
                    <p>{doctor?.personalNumber}</p>
                    <p>{doctor?.workingTime?.timeName === '1' ? 'Plný úvazek' : 'Zkrácený úvazek'}</p>
                    <p>{doctor?.workingTime?.number}</p>
                    <p>{doctor?.workingMode?.modeName === '1' ? 'RRPD' : 'NRPD'}</p>
                </div>

                <select
                    onChange={(e) => router.push(`/doctor/table/${doctorId}/summary/${e.target.value}`)}
                    defaultValue={year}
                >
                    {yearsArray.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
            <table className={classes.table}>
                <thead>
                    <tr>
                        <th>Měsic</th>
                        <th>celkem</th>
                        <th>norma</th>
                        <th>přesčas</th>
                        <th>přesčas všedni</th>
                        <th>přesčas vikend</th>
                        <th>dopočet</th>
                        <th>svátek</th>
                        <th>So + Ne</th>
                        <th>noc</th>
                        <th>dovolena</th>
                        <th>služba</th>
                    </tr>
                </thead>
                <tbody>
                    {monthlyData.map((data, index) => (
                        <tr key={index}>
                            <td><Link href={`/doctor/table/${doctorId}/${index + 1}/${year}`}>{index + 1}</Link></td>
                            <td>{data.totalHours}</td>
                            {data.normPartTimeHours ? <td>{data.normPartTimeHours}</td> : <td>{data.normHours}</td>}

                            <td>{data.overtimeHours}</td>
                            <td>{data.overtimeWorkDay}</td>
                            <td>{data.overtimeWeekend}</td>
                            {data.normPartTimeHours ? <td>{data.overtimePartTime}</td> : <td>----</td>}

                            <td>{data.holidayHours}</td>
                            <td>{data.weekendHours}</td>
                            <td>{data.nightHours}</td>
                            <td>{data.off / 8}</td>
                            <td>{data.h / 24}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Total</td>
                        <td>{totals.totalHours}</td>
                        <td>{totals.normPartTimeHours + totals.normHours}</td>

                        <td>{totals.overtimeHours}</td>
                        <td>{totals.overtimeWorkDay}</td>
                        <td>{totals.overtimeWeekend}</td>
                        {totals.normPartTimeHours ? <td>{totals.overtimePartTime}</td> : <td>----</td>}

                        <td>{totals.holidayHours}</td>
                        <td>{totals.weekendHours}</td>
                        <td>{totals.nightHours}</td>
                        <td>{totals.off / 8}</td>

                        <td>{totals.h / 24}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
