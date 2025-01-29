'use client'
import { useEffect, useState } from 'react';
import classes from './page.module.css'
import { useHttp } from '@/hooks/useHttpHook';
import Link from 'next/link';
import Image from 'next/image';

export default function Template() {
    const [templates, setTemplates] = useState([])
    const { req, error, loading, message } = useHttp()

    useEffect(() => {
        const fetchShiftTemplates = async () => {
            try {
                const response = await req(`/api/template/getAll`, 'GET');
                const templates = response.templates;
                setTemplates(templates);
            } catch (error) {
                console.log(error);
            }
        }
        fetchShiftTemplates()
    }, [])

    const deleteTemplate = async (template) => {
        try {
            const confirmed = window.confirm(`Chcete smazat šablonu "${template?.name}" ?`);
            if (confirmed) {
                await req(`/api/template/delete/${template?._id}`, 'DELETE');
                setTemplates((prevTemplates) => prevTemplates?.filter((prevTemplate) => prevTemplate?._id !== template._id));
            }
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <main className={classes.main}>
            <div className={classes.templates}>
                {templates?.map((template) => (
                    <div className={classes.template}>
                        <p>{template.name}</p>
                        <button onClick={() => deleteTemplate(template)}>Smazat</button>
                    </div>
                ))}
            </div>
        </main>
    )
}
