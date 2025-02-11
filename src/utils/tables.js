export function getCzechHolidays(year) {
    // Функция для вычисления Пасхи
    function getEasterDate(year) {
        const a = year % 19
        const b = Math.floor(year / 100)
        const c = year % 100
        const d = Math.floor(b / 4)
        const e = b % 4
        const f = Math.floor((b + 8) / 25)
        const g = Math.floor((b - f + 1) / 3)
        const h = (19 * a + b - d - g + 15) % 30
        const i = Math.floor(c / 4)
        const k = c % 4
        const l = (32 + 2 * e + 2 * i - h - k) % 7
        const m = Math.floor((a + 11 * h + 22 * l) / 451)
        const month = Math.floor((h + l - 7 * m + 114) / 31)
        const day = ((h + l - 7 * m + 114) % 31) + 1

        return new Date(year, month - 1, day) // Месяц в JavaScript начинается с 0
    }

    // Вычисляем даты Пасхи и связанных праздников
    const easter = getEasterDate(year)
    const goodFriday = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2) // Velký pátek
    const easterMonday = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1) // Velikonoční pondělí

    // Фиксированные праздники
    const holidays = [
        `1/1/${year}`,  // Nový rok, Den obnovy samostatného českého státu
        `${goodFriday.getDate()}/${goodFriday.getMonth() + 1}/${goodFriday.getFullYear()}`, // Velký pátek
        `${easterMonday.getDate()}/${easterMonday.getMonth() + 1}/${easterMonday.getFullYear()}`, // Velikonoční pondělí
        `1/5/${year}`,  // Svátek práce
        `8/5/${year}`,  // Den vítězství
        `5/7/${year}`,  // Den slovanských věrozvěstů Cyrila a Metoděje
        `6/7/${year}`,  // Den upálení mistra Jana Husa
        `28/9/${year}`, // Den české státnosti
        `28/10/${year}`,// Den vzniku samostatného československého státu
        `17/11/${year}`,// Den boje za svobodu a demokracii
        `24/12/${year}`,// Štědrý den
        `25/12/${year}`,// 1. svátek vánoční
        `26/12/${year}` // 2. svátek vánoční
    ]

    return holidays
}

export function getDaysInMonth(holidays, month, year) {
    month = month - 1
    const date = new Date(year, month + 1, 0)
    const daysInMonth = date.getDate()

    const daysArray = []
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day)
        const formattedDate = `${day}/${month + 1}/${year}`
        const dayOfWeek = currentDate.toLocaleDateString('cs-CZ', { weekday: 'long' }).substring(0, 2).toUpperCase()
        const isWeekend = [0, 6].includes(currentDate.getDay())
        const isHoliday = holidays.includes(formattedDate)

        daysArray.push({
            formattedDate,
            day,
            dayOfWeek,
            isWeekend,
            isHoliday
        })
    }

    return daysArray
}

export function getRelevantItem(items, month, year) {
    console.log(items, month, year)
    if (!Array.isArray(items) || items.length === 0) return null

    return items.reduce((latest, current) => {
        const { month: itemMonth, year: itemYear } = current.validFrom
        const isEarlier = itemYear < Number(year) || (itemYear == Number(year) && itemMonth <= Number(month))

        if (!isEarlier) return latest
        if (!latest) return current

        const latestDate = latest.validFrom
        return (itemYear > latestDate.year || (itemYear == latestDate.year && itemMonth > latestDate.month)) ? current : latest
    }, null)
}
