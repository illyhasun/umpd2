'use client'
import { useHttp } from '@/hooks/useHttpHook';
import classes from './csvShiftsForm.module.css'
import { useState } from 'react';

export default function CsvShiftsForm({doctorId, fetchDoctorData}) {

    const [file, setFile] = useState(null); // Состояние для хранения загруженного файла
    const { req, loading, message, error } = useHttp()

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        await req(`/api/doctor/shift/add/xml/${doctorId}`, 'PATCH', formData);
        console.log(message, error)
        fetchDoctorData()
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Výberte scv soubor:</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
            >
                {loading ? 'Načitaní...' : 'Načist'}
            </button>
        </form>
    )
}
