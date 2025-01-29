'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useHttp } from '@/hooks/useHttpHook';
import Notification from '@/components/ui/notification';

import classes from './page.module.css'
import Image from 'next/image';

export default function UpdateDoctor({ params: { doctorId } }) {
  const { req, loading, error, message } = useHttp();
  const [formValues, setFormValues] = useState({
    name: '',
    personalNumber: '',
    workingMode: [],
    workingTime: [],
    shifts: [],
  });


  const router = useRouter();

  const days = ['PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO', 'NE']

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await req(`/api/doctor/getById/${doctorId}`, 'GET');
        const initialData = response.doctor;
        setFormValues({
          name: initialData?.name || '',
          personalNumber: initialData?.personalNumber || '',
          workingMode: initialData?.workingMode || [],
          workingTime: initialData?.workingTime || [],
          shifts: initialData?.shifts || [],
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchDoctorData();
  }, [doctorId, req]);

  console.log(formValues)

  const handleInputChange = (e, index = null, section = null, nestedField = null, indexIndex = null) => {
    const { name, value } = e.target;

    setFormValues((prevValues) => {
      if (section === null) {
        return {
          ...prevValues,
          [name]: value,
        };
      }

      if (nestedField && indexIndex !== null) {
        // Обработка массива workingDays
        return {
          ...prevValues,
          [section]: prevValues[section].map((item, idx) =>
            idx === index
              ? {
                ...item,
                [nestedField]: item[nestedField].map((dayValue, dayIdx) =>
                  dayIdx === indexIndex ? value : dayValue
                ),
              }
              : item
          ),
        };
      }

      if (nestedField) {
        // Обработка вложенных объектов, кроме массива workingDays
        return {
          ...prevValues,
          [section]: prevValues[section].map((item, idx) =>
            idx === index ? { ...item, [nestedField]: { ...item[nestedField], [name]: value } } : item
          ),
        };
      }

      // Обработка обычных массивов (например, workingMode, workingTime)
      return {
        ...prevValues,
        [section]: prevValues[section].map((item, idx) =>
          idx === index ? { ...item, [name]: value } : item
        ),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await req(`/api/doctor/update/${doctorId}`, 'PATCH', formValues);
      if (response.success) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addSelect = (e, section) => {
    e.preventDefault();

    const name = `${section.substring(section.length - 4).toLowerCase}Name`;


    const newItem = {
      [name]: '',
      validFrom: { month: '', year: '' },
      workingDays: Array(7).fill(''), // Инициализация массива для 7 дней
      number: ''
    };

    setFormValues((prevValues) => ({
      ...prevValues,
      [section]: [...prevValues[section], newItem]
    }));
  };

  const removeSelect = (e, index, section) => {
    e.preventDefault();

    setFormValues((prevValues) => ({
      ...prevValues,
      [section]: prevValues[section].filter((_, idx) => idx !== index),
    }));
  };

  return (
    <main className={classes.update}>
      <form onSubmit={handleSubmit}>

        <Notification loading={loading} error={error} message={message} />

        <div className={classes.personalInfo}>
          <div className={classes.inputContainer}>
            <label htmlFor='name'>Jméno a příjmení</label>
            <input name='name' placeholder='Pavel Tatar' required onChange={handleInputChange} value={formValues?.name || ''} disabled={loading} />
          </div>

          <div className={classes.inputContainer}>
            <label htmlFor='personalNumber'>Osobní číslo:</label>
            <input name='personalNumber' placeholder='1234' required onChange={handleInputChange} value={formValues?.personalNumber || ''} disabled={true} />
          </div>
        </div>

        <div className={classes.mapInput}>
          <div className={classes.title}>
            <h4>Pracovní režimy:</h4>
            <button type='button' onClick={(e) => addSelect(e, 'workingMode')}>
              <Image src='/icons/add.svg' alt='add' height={15} width={15} />
              Přidat pracovní režim
            </button>
          </div>

          {formValues?.workingMode && formValues.workingMode.map((mode, index) => (
            <div key={index} className={classes.inputsContainer}>
              <select name='modeName' required onChange={(e) => handleInputChange(e, index, 'workingMode')} value={mode.modeName} disabled={loading}>
                <option value='1'>RRPD</option>
                <option value='2'>NRPD</option>
              </select>
              <div className={classes.inputContainer}>
                <label>Platnost od (Měsíc):</label>
                <input name='month' placeholder='10' required onChange={(e) => handleInputChange(e, index, 'workingMode', 'validFrom')} value={mode?.validFrom?.month || ''} disabled={loading} />
              </div>
              <div className={classes.inputContainer}>
                <label>Platnost od (Rok):</label>
                <input name='year' placeholder='2024' required onChange={(e) => handleInputChange(e, index, 'workingMode', 'validFrom')} value={mode?.validFrom?.year || ''} disabled={loading} />
              </div>

              {!mode?.validFrom?.month && !mode?.validFrom?.year && (
                <button onClick={(e) => removeSelect(e, index, 'workingMode')}>
                  <Image src='/icons/delete.svg' alt='add' height={15} width={15} />
                  Smazat
                </button>
              )}

            </div>
          ))}
        </div>

        <div className={classes.mapInput}>
          <div className={classes.title}>
            <h4>Uvázky:</h4>
            <button type='button' onClick={(e) => addSelect(e, 'workingTime')}>
              <Image src='/icons/add.svg' alt='add' height={15} width={15} />
              Přidat Uvázek
            </button>
          </div>

          {formValues?.workingTime && formValues.workingTime.map((time, index) => (
            <div key={index} >
              <div className={classes.inputsContainer}>

                <select name='timeName' required onChange={(e) => handleInputChange(e, index, 'workingTime')} value={time.timeName || ''} disabled={loading}>
                  <option value='1'>Plný</option>
                  <option value='2'>Častečný</option>
                </select>

                {time.timeName === '2' &&
                  <div className={classes.inputContainer}>
                    <label>uvazek cislo:</label>
                    <input name='number' placeholder='10' required onChange={(e) => handleInputChange(e, index, 'workingTime')} value={time?.number || ''} disabled={loading} />
                  </div>
                }

                <div className={classes.inputContainer}>
                  <label>Platnost od (Měsíc):</label>
                  <input name='month' placeholder='10' required onChange={(e) => handleInputChange(e, index, 'workingTime', 'validFrom')} value={time?.validFrom?.month || ''} disabled={loading} />
                </div>
                <div className={classes.inputContainer}>
                  <label>Platnost od (Rok):</label>
                  <input name='year' placeholder='2024' required onChange={(e) => handleInputChange(e, index, 'workingTime', 'validFrom')} value={time?.validFrom?.year || ''} disabled={loading} />
                </div>

                {!time?.validFrom?.month && !time?.validFrom?.year && (
                  <button onClick={(e) => removeSelect(e, index, 'workingTime')}>
                    <Image src='/icons/delete.svg' alt='add' height={15} width={15} />
                    Smazat
                  </button>
                )}
              </div>
              <div className={classes.workingDays}>
                {time.timeName === '2' && days.map((day, idx) => (
                  <div className={classes.dayInputContainer} key={idx}>
                    <label>{day}</label>
                    <input
                      name="workingDays"
                      placeholder="8"
                      onChange={(e) => handleInputChange(e, index, 'workingTime', 'workingDays', idx)}
                      value={time?.workingDays?.[idx] || ''}
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>


            </div>
          ))}
        </div>

        <button type='submit' disabled={loading}>{loading ? 'Aktualizování...' : 'Aktualizovat'}</button>
      </form>
    </main>
  );
}
