'use client'
import { useEffect, useState } from 'react';

import { useHttp } from '@/hooks/useHttpHook';

import Notification from '@/components/ui/notification';
import DoctorList from './components/doctorList';
import SearchByPn from './components/searchByPn';
import AllDoctors from './components/allDoctors';
import AddDoctor from './components/addDoctor';

import classes from './page.module.css'



export default function Doctors() {

    const { loading, req, error, message } = useHttp();
    const [doctors, setDoctors] = useState([]);

    const allDoctors = async () => {
        try {
            console.log('getall')
            const response = await req("/api/doctor/getAll");
            const sortedDoctors = response.doctors.sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );
            setDoctors(sortedDoctors || []);
        } catch (error) {
            console.log("Chyba při načítání dat lekářů z databáze", error);
            setDoctors([]);
        }
    }

    const deleteDoctor = async (doctor) => {
        try {
            const confirmed = window.confirm(`Chcete smazat všechna data lékaře "${doctor?.name} ${doctor?.personalNumber}" ?`);
            if (confirmed) {
                await req(`/api/doctor/delete/${doctor._id}`, 'DELETE');
                setDoctors((prevDoctors) => prevDoctors.filter((prevDoctors) => prevDoctors._id !== doctor._id));
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        allDoctors()
    }, [])

    return (
        <main className={classes.people}>
            {/* <Notification loading={loading} error={error} message={message} /> */}
            <div className={classes.container}>
                <SearchByPn setDoctors={setDoctors} req={req} loading={loading} allDoctors={allDoctors} />

                {/* <div className={classes.buttons}>
                    <AllDoctors setDoctors={setDoctors} req={req} loading={loading} />
                    <AddDoctor />
                </div> */}
            </div>

            <DoctorList doctors={doctors} deleteDoctor={deleteDoctor} />

        </main>
    );
};