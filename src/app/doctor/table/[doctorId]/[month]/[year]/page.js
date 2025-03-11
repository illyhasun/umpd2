'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { useHttp } from '@/hooks/useHttpHook'

import MonthSummary from './components/monthSummary'
import DoctorInfo from './components/infoHeader/doctorInfo'
import CsvShiftsForm from './components/infoHeader/csvShiftsForm'
import MonthYearSelect from './components/infoHeader/monthYearSelect'
import TemplateSelect from './components/infoHeader/templateSelect'
import TemplateDelete from './components/infoHeader/templateDelete'
import ShiftTypes from './components/shiftTypes'
import Table from './components/table'

import { getCzechHolidays, getDaysInMonth, getRelevantItem } from '@/utils/tables'

import classes from './page.module.css'
import CopyButton from './components/infoHeader/copyButton'

export default function DoctorShifts({ params: { doctorId, month, year } }) {

    const { req } = useHttp()
    const [doctor, setDoctor] = useState(null)
    const [selectedShiftRange, setSelectedShiftRange] = useState({ date: null, from: null, to: null })
    const [e, setE] = useState(false)

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const response = await req(`/api/doctor/getById/${doctorId}/shiftsByMonth/${month}/${year}`, 'GET')
                if (response.success) {
                    setDoctor(response.doctor)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchDoctorData()
    }, [req, doctorId, month, year])

    const holidays = getCzechHolidays(year)
    const days = getDaysInMonth(holidays, Number(month), Number(year))

    const workingTime = getRelevantItem(doctor?.workingTime, month, year)
    const workingMode = getRelevantItem(doctor?.workingMode, month, year)

    const shifts = e ? (doctor?.eShifts ? doctor.eShifts : []) : (doctor?.shifts ? doctor.shifts : [])
    const filteredShifts = shifts.filter(shift => shift.date.month == Number(month) && shift.date.year == Number(year))

    return (

        <main className={classes.tableContainer}>
            <div className={classes.info}>

                <DoctorInfo doctor={doctor} workingTime={workingTime} workingMode={workingMode} />
                <CsvShiftsForm doctorId={doctorId} setDoctor={setDoctor} />

                <div className={classes.actions}>
                    <button onClick={() => setE(!e)}>{e ? 'E' : 'S'}</button>
                    {filteredShifts.length === 0 && e && <CopyButton setDoctor={setDoctor} doctorId={doctorId} month={month} year={year} />}

                    <Link className={classes.a} href={`/doctor/table/${doctorId}/summary/${year}`}>Roční</Link>
                    <MonthYearSelect year={year} month={month} doctor={doctor} />
                    {filteredShifts.length === 0 ?
                        <TemplateSelect doctorId={doctorId} setDoctor={setDoctor} month={month} year={year} e={e} /> :
                        <TemplateDelete doctorId={doctorId} setDoctor={setDoctor} month={month} year={year} e={e} />}
                </div>

                <p className={classes.printMonth}>{month}/{year}</p>
            </div>

            <ShiftTypes selectedShiftRange={selectedShiftRange} setSelectedShiftRange={setSelectedShiftRange} doctorId={doctorId} setDoctor={setDoctor} e={e} />
            <Table selectedShiftRange={selectedShiftRange} setSelectedShiftRange={setSelectedShiftRange} days={days} holidays={holidays} shifts={shifts} />
            <MonthSummary days={days} holidays={holidays} workingTime={workingTime} filteredShifts={filteredShifts} />
        </main>
    )
}
