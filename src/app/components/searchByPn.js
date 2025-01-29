import Image from 'next/image'
import classes from './searchByPn.module.css'

export default function SearchByPn({ setDoctors, req, loading, allDoctors }) {

    const handleSearch = async (pn) => {
        if(pn.length === 4){
            try {
                const response = await req(`/api/doctor/getByPersonalCode/${pn}`);
                setDoctors(response.doctor || []);
            } catch (error) {
                console.log('Chyba při načítání dat lekáře podle osobního čísla z databáze', error);
                setDoctors([]);
            }
        }
        if(pn.length === 0){
            allDoctors()
        }
    };

    return (
        <div className={classes.search}>
            <div className={classes.inputContainer}>
                <label>Zadejte osobní číslo lekáře:</label>
                <input type="text" onChange={(e) => handleSearch(e.target.value)} />
            </div>
            <button onClick={allDoctors} disabled={loading}>
                <Image src='/icons/list.svg' alt='list' height={15} width={15} />
                Všichni lékaři
            </button>
        </div>
    )
}