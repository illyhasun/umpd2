import Link from 'next/link'
import classes from './header.module.css'
import Image from 'next/image'

export default function Header() {
  return (
    <header className={classes.header}>
      <div>
        <Link href='/'>Seznám lékářu</Link>
        <Link href='/template'>Seznám šablon</Link>
      </div>
      <div>
        <Link href='/doctor/create' className={classes.link}>
          <Image src='/icons/add.svg' alt='add' height={15} width={15} />
          Přídát lekáře
        </Link>
        <Link href='/template/add' className={classes.link}>
          <Image src='/icons/add.svg' alt='add' height={15} width={15} />
          Přídát šablonů
        </Link>
      </div>
    </header>
  )
}
