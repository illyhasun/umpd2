import { useHttp } from '@/hooks/useHttpHook';
import classes from './allDoctors.module.css'
import Image from 'next/image';

export default function AllDoctors({ setDoctors, req, loading }) {

    const allDoctors = async () => {
        try {
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

    return (
        <button onClick={allDoctors} disabled={loading} className={classes.button}>
            <Image src='/icons/list.svg' alt='list' height={15} width={15} />
            Všichni lékaři
        </button>
    )
}
