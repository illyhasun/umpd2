'use client'
import { useHttp } from "@/hooks/useHttpHook";
import { useState, useEffect } from "react";
import classes from './page.module.css'
import Link from "next/link";
import { useRouter } from "next/navigation";

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


    function getDaysInMonth(month, year) {
        month = month - 1;
        const date = new Date(year, month + 1, 0);
        const daysInMonth = date.getDate();

        const daysArray = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const formattedDate = `${day}/${month + 1}/${year}`
            const dayOfWeek = currentDate.toLocaleDateString('cs-CZ', { weekday: 'long' }).substring(0, 2).toUpperCase();
            const isWeekend = [0, 6].includes(currentDate.getDay());
            const isHoliday = holidays.includes(formattedDate)

            daysArray.push({
                formattedDate,
                day,
                dayOfWeek,
                isWeekend,
                isHoliday
            });
        }

        return daysArray;
    }

    function getCzechHolidays(year) {
        // Функция для вычисления Пасхи
        function getEasterDate(year) {
            const a = year % 19;
            const b = Math.floor(year / 100);
            const c = year % 100;
            const d = Math.floor(b / 4);
            const e = b % 4;
            const f = Math.floor((b + 8) / 25);
            const g = Math.floor((b - f + 1) / 3);
            const h = (19 * a + b - d - g + 15) % 30;
            const i = Math.floor(c / 4);
            const k = c % 4;
            const l = (32 + 2 * e + 2 * i - h - k) % 7;
            const m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31);
            const day = ((h + l - 7 * m + 114) % 31) + 1;

            return new Date(year, month - 1, day); // Месяц в JavaScript начинается с 0
        }

        // Вычисляем даты Пасхи и связанных праздников
        const easter = getEasterDate(year);
        const goodFriday = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2); // Velký pátek
        const easterMonday = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1); // Velikonoční pondělí

        // Фиксированные праздники
        const holidays = [
            `1/1/${year}`,  // Nový rok, Den obnovy samostatného českého státu
            `${goodFriday.getDate()}/${goodFriday.getMonth() + 1}/${goodFriday.getFullYear()}`, // Velký pátek
            `${easterMonday.getDate()}/${easterMonday.getMonth() + 1}/${easterMonday.getFullYear()}`, // Velikonoční pondělí
            `1/5/${year}`,  // Svátek práce
            `8/5/${year}`,  // Den vítězství
            `5/7/${year}`,  // Den slovanských věrozvěstů Cyrila a Metoděje
            `6/7/${year}`,  // Den upálení mistra Jana Husa
            `28/9/${year}`, // Den české státnosti
            `28/10/${year}`,// Den vzniku samostatného československého státu
            `17/11/${year}`,// Den boje za svobodu a demokracii
            `24/12/${year}`,// Štědrý den
            `25/12/${year}`,// 1. svátek vánoční
            `26/12/${year}` // 2. svátek vánoční
        ];

        return holidays;
    }

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

    function getRelevantItem(items, month) {
        if (!Array.isArray(items) || items.length === 0) {
            return
        }
        const result = items
            .filter(item => {
                const { month: itemMonth, year: itemYear } = item.validFrom;
                return itemYear < Number(year) || (itemYear === Number(year) && itemMonth <= Number(month));
            })
        const deducedResult = result.reduce((latest, current) => {
            if (!latest) {
                return current;
            }
            const latestDate = latest.validFrom;
            const currentDate = current.validFrom;
            return (currentDate.year > latestDate.year ||
                (currentDate.year === latestDate.year && currentDate.month > latestDate.month))
                ? current
                : latest;
        }, null);

        return deducedResult
    }

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const response = await req(`/api/doctor/getById/${doctorId}`, 'GET');
                setDoctor(response.doctor);
            } catch (err) {
                console.error(err);
            }
        };

        fetchDoctorData();
    }, [doctorId, req]);

    function calculateMonthlyWorkedHours(month) {

        const workingTime = getRelevantItem(doctor?.workingTime, month)

        if (!doctor || !doctor.shifts) return null;

        const filteredShifts = doctor.shifts.filter(shift => {
            return shift.date.year === Number(year) && shift.date.month === month;
        });

        const days = getDaysInMonth(month, year);

        const NIGHT_START = 22; // 10 PM
        const NIGHT_END = 6;   // 6 AM

        let totalHours = 0
        let weekendHours = 0
        let nightHours = 0
        let holidayHours = 0;
        let normPartTimeHours = 0
        let normHolidayHours = 0
        let off = 0


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

        const serviceCount = doctor?.services.find(service => service.month === Number(month) && service.year === Number(year))?.count || 0

        return { totalHours, weekendHours, holidayHours, nightHours, overtimeHours, overtimeWorkDay, overtimeWeekend, overtimePartTime, normHours, normPartTimeHours, normHolidayHours, off, serviceCount }
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
            acc.serviceCount += data.serviceCount
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
            serviceCount: 0
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
                            <td>{data.serviceCount}</td>
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

                        <td>{totals.serviceCount}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
