import { useHttp } from '@/hooks/useHttpHook';
import classes from './copyButton.module.css'

export default function CopyButton({ setDoctor, doctorId, month, year }) {
    const { req } = useHttp()

    const copyData = async () => {
        try {
            await req(`/api/doctor/shift/copy/${doctorId}/${month}/${year}`, 'PATCH');
            setDoctor((prevDoctor) => ({
                ...prevDoctor,
                eShifts: prevDoctor.shifts.filter(
                    shift => shift.date.month == month && shift.date.year == year
                )
            }));
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <button onClick={copyData}>kopirovat</button>)
}
