'use client'
import { useHttp } from '@/hooks/useHttpHook';
import classes from './templateSelect.module.css'
import { useState, useEffect } from 'react';

export default function TemplateSelect({ doctorId, setDoctor, month, year, e }) {

    const [templates, setTemplates] = useState(null)
    const { req, message, loading, error } = useHttp()

    useEffect(() => {
        fetchShiftTemplates()
    }, []);

    const fetchShiftTemplates = async () => {
        try {
            const response = await req(`/api/template/getAll`, 'GET');
            const templates = response.templates;
            setTemplates(templates);
        } catch (error) {
            console.log(error);
        }
    }


    const handleConfirmTemplate = async (templateId) => {
        try {
            const response = await req(`/api/doctor/shift/add/template/${doctorId}`, 'PATCH', {
                doctorId, templateId, month, year, e
            });

            setDoctor(response.doctor)
        } catch (error) {
            console.error("Failed to add shift", error);
        }
    };

    return (
        <select className={classes.useTemplates} onChange={(e) => handleConfirmTemplate(e.target.value)}>
            <option>Výberte šablonu</option>
            {templates?.map(template => <option key={template._id} value={template._id}>{template.name}</option>)}
        </select>
    )
}
