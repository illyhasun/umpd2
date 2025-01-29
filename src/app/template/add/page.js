'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useHttp } from '@/hooks/useHttpHook';

import { getCurrentMonthFormatted, getCurrentYearFormatted } from '@/utils/date';

import Message from '@/components/ui/notification';

import classes from './page.module.css';
import Notification from '@/components/ui/notification';


export default function AddTemplate() {

    const router = useRouter();
    const { req, loading, error, message } = useHttp();

    const [formValues, setFormValues] = useState({
        name: '',
        monday: {
            from: '',
            to: '',
            pause: ''
        },
        tuesday: {
            from: '',
            to: '',
            pause: ''

        },
        wednesday: {
            from: '',
            to: '',
            pause: ''

        },
        thursday: {
            from: '',
            to: '',
            pause: ''

        },
        friday: {
            from: '',
            to: '',
            pause: ''

        },
        saturday: {
            from: '',
            to: '',
            pause: ''

        },
        sunday: {
            from: '',
            to: '',
            pause: ''
        }
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        
            const [day, field] = name.split('_');
        if (field) {
            setFormValues((prevValues) => ({
                ...prevValues,
                [day]: {
                    ...prevValues[day],
                    [field]: value,
                },
            }));
        } else {
            setFormValues((prevValues) => ({
                ...prevValues,
                [name]: value,
            }));
        }
    };
    

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            console.log(formValues)
            const response = await req('/api/template/add', 'POST', formValues);
            if (response.success) {
                router.push('/');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <main className={classes.add}>
            <Notification loading={loading} error={error} message={message} />
            <form onSubmit={handleSubmit}>
                <div className={classes.inputContainer}>
                    <label htmlFor='name'>Nazev:</label>
                    <input name='name' placeholder='5/8 7:30' required onChange={handleInputChange} />
                </div>

                <h3>Pondělí</h3>
                <div className={classes.inputsContainer}>
                    <label htmlFor='monday_from'>od</label>
                    <input name='monday_from' placeholder='7.5' onChange={handleInputChange} />
                    <label htmlFor='monday_to'>do</label>
                    <input name='monday_to' placeholder='16' onChange={handleInputChange} />
                    <label htmlFor='monday_pause'>pauza od</label>
                    <input name='monday_pause' placeholder='12' onChange={handleInputChange} />
                </div>

                <h3>Úterý</h3>
                <div className={classes.inputsContainer}>
                    <label htmlFor='tuesday_from'>od</label>
                    <input name='tuesday_from' placeholder='7.5' onChange={handleInputChange} />
                    <label htmlFor='tuesday_to'>do</label>
                    <input name='tuesday_to' placeholder='16' onChange={handleInputChange} />
                    <label htmlFor='tuesday_pause'>pauza od</label>
                    <input name='tuesday_pause' placeholder='12' onChange={handleInputChange} />
                </div>
                <h3>Středa</h3>
                <div className={classes.inputsContainer}>
                    <label htmlFor='wednesday_from'>od</label>
                    <input name='wednesday_from' placeholder='7.5' onChange={handleInputChange} />
                    <label htmlFor='wednesday_to'>do</label>
                    <input name='wednesday_to' placeholder='16' onChange={handleInputChange} />
                    <label htmlFor='wednesday_pause'>pauza od</label>
                    <input name='wednesday_pause' placeholder='12' onChange={handleInputChange} />
                </div>
                <h3>Čtvrtek</h3>
                <div className={classes.inputsContainer}>
                    <label htmlFor='thursday_from'>od</label>
                    <input name='thursday_from' placeholder='7.5' onChange={handleInputChange} />
                    <label htmlFor='thursday_to'>do</label>
                    <input name='thursday_to' placeholder='16' onChange={handleInputChange} />
                    <label htmlFor='thursday_pause'>pauza od</label>
                    <input name='thursday_pause' placeholder='12' onChange={handleInputChange} />
                </div>
                <h3>Pátek</h3>
                <div className={classes.inputsContainer}>
                    <label htmlFor='friday_from'>od</label>
                    <input name='friday_from' placeholder='7.5' onChange={handleInputChange} />
                    <label htmlFor='friday_to'>do</label>
                    <input name='friday_to' placeholder='16' onChange={handleInputChange} />
                    <label htmlFor='friday_pause'>pauza od</label>
                    <input name='friday_pause' placeholder='12' onChange={handleInputChange} />
                </div>
                <h3>Sobota</h3>
                <div className={classes.inputsContainer}>
                    <label htmlFor='saturday_from'>od</label>
                    <input name='saturday_from' placeholder='7.5' onChange={handleInputChange} />
                    <label htmlFor='saturday_to'>do</label>
                    <input name='saturday_to' placeholder='16' onChange={handleInputChange} />
                    <label htmlFor='saturday_pause'>pauza od</label>
                    <input name='saturday_pause' placeholder='12' onChange={handleInputChange} />
                </div>
                <h3>Neděle</h3>
                <div className={classes.inputsContainer}>
                    <label htmlFor='sunday_from'>od</label>
                    <input name='sunday_from' placeholder='7.5' onChange={handleInputChange} />
                    <label htmlFor='sunday_to'>do</label>
                    <input name='sunday_to' placeholder='16' onChange={handleInputChange} />
                    <label htmlFor='sunday_pause'>pauza od</label>
                    <input name='sunday_pause' placeholder='12' onChange={handleInputChange} />
                </div>

                <button type='submit' disabled={loading}>{loading ? 'Přidávání...' : 'Přidat'}</button>
            </form>
        </main>
    )
}

