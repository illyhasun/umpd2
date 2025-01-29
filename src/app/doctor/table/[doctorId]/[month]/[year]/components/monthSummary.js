import { useState } from 'react'
import classes from './monthSummary.module.css'
import { useHttp } from '@/hooks/useHttpHook'

export default function MonthSummary({ doctor, days, workingTime, holidays, filteredShifts, year, month }) {

    const [serviceCount, setServiceCount] = useState(doctor?.services.find(service => service.month === Number(month) && service.year === Number(year))?.count || 0)
    const { req, message, loading, error } = useHttp()

    function calculatePartTimeNorm(hoursArray) {

        let totalHours = 0
        let totalHolidayHours = 0

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


    const handleBlur = async (e) => {
        const count = e.target.value;

        if (!count || isNaN(Number(count)) || Number(count) === Number(serviceCount)) {
            return;
        }
        try {
            const response = await req(`/api/doctor/service/${doctor._id}`, 'PATCH', { month, year, count: Number(count) });

            if (!response.success) {
                console.error(data.message);
                alert('Chyba.');
            } else {
                setServiceCount(count)
                alert('Počet slůžb byl změněn');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сети.');
        }
    };



    const NIGHT_START = 22; // 10 PM
    const NIGHT_END = 6;   // 6 AM

    let totalHours = 0
    let weekendHours = 0
    let nightHours = 0
    let holidayHours = 0;
    let normPartTimeHours = 0
    let normHolidayHours = 0
    const typeHours = { o: 0, n: 0, d: 0, c: 0, r: 0, p: 0, h: 0 };

    const workdays = days.filter(day => !day.isWeekend); // pracovni dny
    const normHours = workdays.length * 8; // norma pracovnich hodin


    if (workingTime?.timeName === '2') {
        const normHours = calculatePartTimeNorm(workingTime.workingDays)
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


        if (type && typeHours[type] !== undefined) {
            typeHours[type] += hours;
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
    totalHours += normHolidayHours
    const overtimeHours = Math.max(0, totalHours - normHours);


    return (
        <div className={classes.summary}>
            <table className={classes.table}>
                <tbody>
                    <tr>
                        <td>Norma pracovních hodin pro tento měsíc (plný úvazek)</td>
                        <td>{normHours}</td>
                    </tr>
                    {normPartTimeHours ? (
                        <tr>
                            <td>Norma pracovních hodin pro tento měsíc (tento úvazek)</td>
                            <td>{normPartTimeHours}</td>
                        </tr>
                    ) : ''}
                    <tr>
                        <td>Počet hodin tento měsíc celkem/odpracovaných/svátek</td>
                        <td>{totalHours}/{totalHours - normHolidayHours}/{normHolidayHours}</td>
                    </tr>
                    <tr>
                        <td>Počet PČ celkem/všední/víkendy</td>
                        <td>{overtimeHours}/{overtimeHours - Math.min(overtimeHours, weekendHours)}/{Math.min(overtimeHours, weekendHours)}</td>
                    </tr>
                    {normPartTimeHours ? (
                        <tr>
                            <td>Počet hodin nad uvazek</td>
                            <td>{Math.max(totalHours - normPartTimeHours - overtimeHours, 0)}</td>
                        </tr>
                    ) : ''}
                    <tr>
                        <td>Počet hodin práce v noci</td>
                        <td>{nightHours}</td>
                    </tr>
                    <tr>
                        <td>Počet hodin práce v So + Ne</td>
                        <td>{weekendHours}</td>
                    </tr>
                    <tr>
                        <td>Počet hodin práce ve svátek</td>
                        <td>{holidayHours}</td>
                    </tr>
                    <tr>
                        <td>Počet služeb v měsíci</td>
                        <td><input
                            className={classes.input}
                            onBlur={handleBlur}
                            type='number'
                            defaultValue={serviceCount}
                        />
                        </td>
                    </tr>
                    <tr>
                        <td>Počet hodin PN:</td>
                        <td>{typeHours.n}</td>
                    </tr>
                    <tr>
                        <td>Počet dovolené dnů/hodin:</td>
                        <td>{typeHours.d / 8}/{typeHours.d}</td>
                    </tr>
                    <tr>
                        <td>Počet hodin SLC: </td>
                        <td>{typeHours.c}</td>
                    </tr>
                    <tr>
                        <td>Počet hodin OČR: </td>
                        <td>{typeHours.r}</td>
                    </tr>
                    <tr>
                        <td>Počet hodin pohotovost: </td>
                        <td>{typeHours.h}</td>
                    </tr>
                </tbody>
            </table>
            <div className={classes.signatures}>
                <p>Podpis zaměstnanec: _____________________________</p>
                <p>Podpis primář: _____________________________</p>
            </div>
        </div>
    )
}
