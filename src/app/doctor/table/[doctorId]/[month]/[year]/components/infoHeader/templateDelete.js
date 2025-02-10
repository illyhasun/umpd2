import { useHttp } from '@/hooks/useHttpHook';
import classes from './templateDelete.module.css'

export default function TemplateDelete({ doctorId, setDoctor, month, year, e }) {
    const { req } = useHttp()

    const handleDeleteMonth = async () => {
        try {
            await req(`/api/doctor/shift/deleteMonth/${month}/${year}/${doctorId}`, 'PATCH', { e });
            setDoctor((prevDoctor) => ({
                ...prevDoctor,
                [e ? "eShifts" : "shifts"]: prevDoctor[e ? "eShifts" : "shifts"].filter(
                    (shift) => !(shift.date.year == year && shift.date.month == month)
                ),
            }));
        } catch (error) {
            console.error("Failed to delete shift", error);
        }
    };
    return (
        <button onClick={() => handleDeleteMonth()}>Vymazat všechno</button>
    )
}
