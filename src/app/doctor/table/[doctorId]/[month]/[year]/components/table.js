import { useState } from 'react';
import classes from './table.module.css'

export default function Table({selectedShiftRange, setSelectedShiftRange, days, holidays, shifts}) {
    const [isDragging, setIsDragging] = useState(false);

    function isShiftScheduled(day, hour) {
        const shift = shifts.find(shift => {
            const shiftDate = `${shift.date.day}/${shift.date.month}/${shift.date.year}`;
            const shiftStart = parseFloat(shift.from);
            const shiftEnd = parseFloat(shift.to);
            return shiftDate === day && hour >= shiftStart && hour < shiftEnd;
        });
        return shift ? shift.type : null;
    }

    const handleCellMouseDown = (day, hour) => {
        setIsDragging(true);
        setSelectedShiftRange({ date: day, from: hour, to: hour });
    };

    const handleCellMouseEnter = (day, hour) => {
        if (isDragging && selectedShiftRange.date === day) {
            setSelectedShiftRange(prev => ({ ...prev, to: hour }));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <table className={classes.table} onMouseUp={handleMouseUp}>
            <thead>
                <tr>
                    <th>Den</th>
                    <th>Datum</th>
                    {Array.from({ length: 24 }, (_, hourIndex) => (
                        <th className={classes.hours} colSpan="2" key={`hour-${hourIndex}`}>{hourIndex + 1}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {days.map((dayObj, index) => (
                    <tr key={`day-${index}`} className={classes.tr}>
                        <td className={holidays.includes(dayObj.formattedDate) ? classes.holiday : dayObj.isWeekend ? classes.weekend : ''}>{dayObj.dayOfWeek}</td>
                        <td className={holidays.includes(dayObj.formattedDate) ? classes.holiday : dayObj.isWeekend ? classes.weekend : ''}>{dayObj.day.toString().length < 2 ? `0${dayObj.day}` : dayObj.day}</td>
                        {Array.from({ length: 48 }, (_, halfHourIndex) => {
                            const hour = (halfHourIndex / 2);
                            const isScheduled = isShiftScheduled(dayObj.formattedDate, hour);
                            const isInRange = selectedShiftRange.date === dayObj.formattedDate && hour >= selectedShiftRange.from && hour <= selectedShiftRange.to
                            return (
                                <td
                                    key={`hour-${index}-${halfHourIndex}`}
                                    className={
                                        isInRange ? classes.selected :
                                            isScheduled === 'o' ? classes.o :
                                                isScheduled === 'n' ? classes.n :
                                                    isScheduled === 'd' ? classes.d :
                                                        isScheduled === 'c' ? classes.c :
                                                            isScheduled === 'r' ? classes.r :
                                                                isScheduled === 'h' ? classes.h :
                                                                    holidays.includes(dayObj.formattedDate) ? classes.holiday :
                                                                        dayObj.isWeekend ? classes.weekend : classes.notScheduled
                                    }
                                    onMouseDown={() => handleCellMouseDown(dayObj.formattedDate, hour)}
                                    onMouseEnter={() => handleCellMouseEnter(dayObj.formattedDate, hour)}
                                >
                                    {
                                        isInRange ? '' :
                                            isScheduled === 'o' ? 'O' :
                                                isScheduled === 'n' ? 'N' :
                                                    isScheduled === 'd' ? 'D' :
                                                        isScheduled === 'c' ? 'C' :
                                                            isScheduled === 'r' ? 'R' :
                                                                isScheduled === 'h' ? 'H' : ''
                                    }
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
