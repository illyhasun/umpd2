import { useHttp } from '@/hooks/useHttpHook';
import classes from './shiftTypes.module.css'

export default function ShiftTypes({ selectedShiftRange, setSelectedShiftRange, fetchDoctorData, doctorId, setDoctor }) {
    const { req } = useHttp()

    const handleConfirmShift = async (type = 'o') => {
        const { date, from, to } = selectedShiftRange;
        const [day, month, year] = date.split('/');

        try {
            const response = await req(`/api/doctor/shift/add/${doctorId}`, 'PATCH', {
                date: { day, month, year },
                from: from.toString(),
                to: (to + 0.5).toString(), // half-hour intervals
                type
            });

            if (response.success) {
                fetchDoctorData()
                setSelectedShiftRange({ date: null, from: null, to: null });
            }
        } catch (error) {
            console.error("Failed to add shift", error);
        }
    };

    const handleDeleteShift = async () => {
        const { date, from, to } = selectedShiftRange;
        const [day, month, year] = date.split('/');

        try {
            const response = await req(`/api/doctor/shift/delete/${doctorId}`, 'PATCH', {
                date: { day, month, year },
                from: from.toString(),
                to: (to + 0.5).toString()
            });

            if (response.success) {
                console.log("Shift deleted successfully");
                fetchDoctorData()
                setSelectedShiftRange({ date: null, from: null, to: null });
            }
        } catch (error) {
            console.error("Failed to delete shift", error);
        }
    };

    return (
        <>
            {selectedShiftRange.date && (
                <div className={classes.types}>
                    <button onClick={() => handleConfirmShift('o')} className={classes.o}>Odpracovaná hodina</button>
                    <button onClick={() => handleConfirmShift('n')} className={classes.n}>Pracovní neschopnost</button>
                    <button onClick={() => handleConfirmShift('d')} className={classes.d}>Dovolená</button>
                    <button onClick={() => handleConfirmShift('c')} className={classes.c}>Služební cesta</button>
                    <button onClick={() => handleConfirmShift('r')} className={classes.r}>Ošetř.člena rodiny</button>
                    <button onClick={() => handleConfirmShift('h')} className={classes.h}>Pohotovost</button>

                    <button onClick={handleDeleteShift} className={classes.delete}>Smazat</button>

                </div>)}
        </>

    )
}
