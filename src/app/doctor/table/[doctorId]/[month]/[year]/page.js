'use client';

import { useState, useEffect } from 'react';
import Message from '@/components/ui/notification';
import classes from './page.module.css';
import { useHttp } from '@/hooks/useHttpHook';
import Link from 'next/link';
import MonthSummary from './components/monthSummary';
import DoctorInfo from './components/infoHeader/doctorInfo';
import CsvShiftsForm from './components/infoHeader/csvShiftsForm';
import MonthYearSelect from './components/infoHeader/monthYearSelect';
import TemplateSelect from './components/infoHeader/templateSelect';
import TemplateDelete from './components/infoHeader/templateDelete';
import ShiftTypes from './components/shiftTypes';
import Table from './components/table';

export default function DoctorShifts({ params: { doctorId, month, year } }) {

    const { req, loading, error, message } = useHttp();
    const [doctor, setDoctor] = useState(null);
    const [selectedShiftRange, setSelectedShiftRange] = useState({ date: null, from: null, to: null });

    const paramsMonth = Number(month, 10);
    const paramsYear = Number(year, 10);

    const fetchDoctorData = async () => {
        try {
            const response = await req(`/api/doctor/getById/${doctorId}`, 'GET');
            const doctor = response.doctor;
            setDoctor(doctor);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchDoctorData();
    }, []);

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

            return new Date(year, month - 1, day);
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
    const holidays = getCzechHolidays(year);



    const shifts = doctor ? doctor.shifts : [];

    const days = getDaysInMonth(paramsMonth, paramsYear);



    const filteredShifts = shifts.filter(shift => {
        const { date } = shift;
        const shiftDate = new Date(date.year, date.month - 1, date.day);
        return shiftDate.getFullYear() === paramsYear && shiftDate.getMonth() + 1 === paramsMonth;
    });

    function getRelevantItem(items) {
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

    const workingTime = getRelevantItem(doctor?.workingTime)
    const workingMode = getRelevantItem(doctor?.workingMode)

    return (

        <main className={classes.tableContainer}>

            <div className={classes.info}>
                <DoctorInfo doctor={doctor} workingTime={workingTime} workingMode={workingMode} />
                <CsvShiftsForm doctorId={doctorId} fetchDoctorData={fetchDoctorData} />

                <div className={classes.monthYear}>
                    <Link className={classes.a} href={`/doctor/table/${doctorId}/summary/${year}`}>Roční</Link>
                    <MonthYearSelect year={year} month={month} doctor={doctor} />
                    {filteredShifts.length === 0 ?
                        <TemplateSelect doctorId={doctorId} fetchDoctorData={fetchDoctorData} month={month} year={year} /> :
                        <TemplateDelete doctorId={doctorId} fetchDoctorData={fetchDoctorData} month={month} year={year} />}
                </div>

                <p className={classes.printMonth}>{month}/{year}</p>
            </div>
            <ShiftTypes selectedShiftRange={selectedShiftRange} setSelectedShiftRange={setSelectedShiftRange} fetchDoctorData={fetchDoctorData} doctorId={doctorId} setDoctor={setDoctor} />
            <Table selectedShiftRange={selectedShiftRange} setSelectedShiftRange={setSelectedShiftRange} days={days} holidays={holidays} shifts={shifts} />
            <MonthSummary doctor={doctor} days={days} holidays={holidays} workingTime={workingTime} filteredShifts={filteredShifts} year={year} month={month} />

        </main>
    );
}
