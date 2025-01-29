import { useRouter } from 'next/navigation';
import classes from './monthYearSelect.module.css'

export default function MonthYearSelect({doctor, year, month}) {
    const router = useRouter()

    const currentYear = new Date().getFullYear();
    const workingModeYears = doctor?.workingMode.map(mode => mode?.validFrom.year);
    const minYear = workingModeYears ? Math.min(...workingModeYears) : 2024;


    const yearsArray = [];
    for (let year = minYear - 1; year <= currentYear + 1; year++) {
        yearsArray.push(year);
    }

    return (
        <>
            <select
                onChange={(e) => router.push(`/doctor/table/${doctor._id}/${e.target.value}/${year}`)}
                defaultValue={month}
            >
                {[...Array(12)].map((_, index) => {
                    const month = index + 1;
                    return (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    );
                })}
            </select>
            <select
                onChange={(e) => router.push(`/doctor/table/${doctor._id}/${month}/${e.target.value}`)}
                defaultValue={year}
            >
                {yearsArray.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
        </>
    )
}
