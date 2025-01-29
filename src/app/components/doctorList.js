import Link from 'next/link'

import classes from './doctorList.module.css'
import Image from 'next/image'

export default function DoctorList({ doctors, deleteDoctor }) {

    const currentDate = new Date();

    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()

    return (
        <>
            {doctors.length > 0 ? (
                <ul key={doctors._id} className={classes.doctorList}>
                    {doctors.map((doctor) => (
                        <li key={doctor._id} className={classes.doctor}>
                            <p>{doctor.name} {doctor.personalNumber}</p>
                            <div className={classes.actions}>
                                <Link href={`/doctor/table/${doctor._id}/${month+1}/${year}`}>
                                    <Image src='/icons/table.svg' alt='table' height={15} width={15} />
                                    VÝKAZY
                                </Link>
                                <Link href={`/doctor/update/${doctor._id}`}>
                                    <Image src='/icons/update.svg' alt='update' height={15} width={15} />
                                    OBNOVIT
                                </Link>
                                <button onClick={() => deleteDoctor(doctor)}>
                                    <Image src='/icons/delete.svg' alt='delete' height={15} width={15} />
                                    SMAZAT
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : <p>Nebyl nalezen žádný doktor</p>}
        </>
    )
}
