'use client'
import { useEffect, useState } from 'react';

import { useHttp } from '@/hooks/useHttpHook';

import DoctorList from './components/doctorList';
import SearchByPn from './components/searchByPn';


import classes from './page.module.css'



export default function Doctors() {

    const { loading, req, error, message } = useHttp();
    const [doctors, setDoctors] = useState([]);

    const allDoctors = async () => {
        try {
            const response = await req("/api/doctor/getAll");
            setDoctors(response.doctors);
        } catch (error) {
            console.error("Chyba při načítání dat lekářů z databáze", error);
            setDoctors([]);
        }
    };

    const deleteDoctor = async (doctor) => {
        try {
            const confirmed = window.confirm(`Chcete smazat všechna data lékaře "${doctor?.name} ${doctor?.personalNumber}"?`);
            if (confirmed) {
                await req(`/api/doctor/delete/${doctor._id}`, 'DELETE');
                setDoctors((prevDoctors) => prevDoctors.filter((prev) => prev._id !== doctor._id));
            }
        } catch (error) {
            console.log(error);
        }
    };
    

    useEffect(() => {
        allDoctors()
    }, [])

    return (
        <main className={classes.doctors}>
            <SearchByPn setDoctors={setDoctors} req={req} loading={loading} allDoctors={allDoctors} />
            <DoctorList doctors={doctors} deleteDoctor={deleteDoctor} />
        </main>
    );
};