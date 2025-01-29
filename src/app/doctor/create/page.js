'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useHttp } from '@/hooks/useHttpHook';

import { getCurrentMonthFormatted, getCurrentYearFormatted } from '@/utils/date';

import Message from '@/components/ui/notification';

import classes from './page.module.css';
import Notification from '@/components/ui/notification';


export default function AddDoctor() {

  const router = useRouter();
  const { req, loading, error, message } = useHttp();


  const [formValues, setFormValues] = useState({
    name: '',
    personalNumber: '',
    workingMode: [{
      modeName: '1',
      validFrom: {
        month: getCurrentMonthFormatted(),
        year: getCurrentYearFormatted()
      }
    }],
    workingTime: [{
      timeName: '1',
      validFrom: {
        month: getCurrentMonthFormatted(),
        year: getCurrentYearFormatted()
      }
    }]
  });

  const handleInputChange = (e, index = null, section = null) => {
    const { name, value } = e.target;

    setFormValues((prevValues) => {
      if (section === null) {
        return {
          ...prevValues,
          [name]: value,
        };
      }

      return {
        ...prevValues,
        [section]: prevValues[section].map((item, idx) =>
          idx === index ? { ...item, [name]: value } : item
        ),
      };
    });
    console.log(formValues)
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      console.log(formValues)
      const response = await req('/api/doctor/create', 'POST', formValues);
      if (response.success) {
        router.push('/');
        router.refresh();
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
          <label htmlFor='name'>Jméno a příjmení:</label>
          <input name='name' placeholder='Pavel Tatar' required onChange={handleInputChange} />
        </div>
        <div className={classes.inputContainer}>
          <label htmlFor='personalNumber'>Osobní číslo:</label>
          <input name='personalNumber' placeholder='1234' required onChange={handleInputChange} />
        </div>
        <div className={classes.inputContainer}>
          <label htmlFor='modeName'>Pracovní režim:</label>
          <select name='modeName' required onChange={(e) => handleInputChange(e, 0, 'workingMode')} defaultValue='1'>
            <option value='1'>RRPD</option>
            <option value='2'>NRPD</option>
          </select>
        </div>
        <div className={classes.inputContainer}>
          <label htmlFor='timeName'>Uvázek</label>
          <select name='timeName' required onChange={(e) => handleInputChange(e, 0, 'workingTime')} defaultValue='1'>
            <option value='1'>Plný</option>
            <option value='2'>Častečný</option>
          </select>
        </div>
        <button type='submit' disabled={loading}>{loading ? 'Přidávání...' : 'Přidat'}</button>
      </form>
    </main>
  )
}

