import { useRouter } from "next/navigation"

import classes from './info.module.css'


export default function Info({doctor, year}) {
    const router = useRouter()
    const currentYear = new Date().getFullYear();
    const workingModeYears = doctor?.workingMode?.map(mode => mode?.validFrom.year);
    const minYear = workingModeYears ? Math.min(...workingModeYears) : 2024;

    const yearsArray = [];
    for (let year = minYear - 1; year <= currentYear + 1; year++) {
        yearsArray.push(year);
    }
    return (
        <div className={classes.info}>
            <div className={classes.doctorInfo}>
                <h1>{doctor?.name}</h1>
                <p>{doctor?.personalNumber}</p>
            </div>

            <select
                onChange={(e) => router.push(`/doctor/table/${doctor._id}/summary/${e.target.value}`)}
                defaultValue={year}
            >
                {yearsArray.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
        </div>
    )
}
