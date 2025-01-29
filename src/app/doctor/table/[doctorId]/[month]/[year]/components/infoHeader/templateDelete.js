import { useHttp } from '@/hooks/useHttpHook';
import classes from './templateDelete.module.css'

export default function TemplateDelete({doctorId, fetchDoctorData, month, year}) {
    const {req, loading, error, message} = useHttp()

    const handleDeleteMonth = async () => {
        try {
            const response = await req(`/api/doctor/shift/deleteMonth/${month}/${year}/${doctorId}`, 'PATCH');
            console.log(response)
            if (response.success) {
                console.log("Month Shifts deleted successfully");
                fetchDoctorData()
            }
        } catch (error) {
            console.error("Failed to delete shift", error);
        }
    };
  return (
    <button onClick={() => handleDeleteMonth()}>Vymazat všechno</button>
  )
}
