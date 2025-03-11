import Link from "next/link";

import classes from './table.module.css'
export default function Table({monthlyData, doctorId, year}) {

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

    return (
        <table className={classes.table}>
            <thead>
                <tr>
                    <th>Měsic</th>
                    <th>celkem</th>
                    <th>norma</th>
                    <th>přesčas</th>
                    <th>přesčas všední</th>
                    <th>přesčas víkend</th>
                    <th>dopočet</th>
                    <th>svátek</th>
                    <th>So + Ne</th>
                    <th>noc</th>
                    <th>dovolená</th>
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
                    <td>Celkem</td>
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
        </table>)
}
