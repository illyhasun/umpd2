import Link from 'next/link'
import classes from './addDoctor.module.css'
import Image from 'next/image'

export default function AddDoctor() {
    return (
        <Link href='/doctor/create' className={classes.link}>
            <Image src='/icons/add.svg' alt='add' height={15} width={15} />
            Přídát lekáře
        </Link>
    )
}
