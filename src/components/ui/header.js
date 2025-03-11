import Link from 'next/link'
import classes from './header.module.css'
import Image from 'next/image'

export default function Header() {
  return (
    <header className={classes.header}>
      <div>
        <Link href='/'>Seznam lékařů</Link>
        <Link href='/template'>Seznam šablon</Link>
      </div>
      <div>
        <Link href='/doctor/create' className={classes.link}>
          <Image src='/icons/add.svg' alt='add' height={15} width={15} />
          Přidat lekáře
        </Link>
        <Link href='/template/add' className={classes.link}>
          <Image src='/icons/add.svg' alt='add' height={15} width={15} />
          Přidat šablonu
        </Link>
      </div>
    </header>
  )
}
