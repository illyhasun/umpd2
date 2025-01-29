export function getCurrentMonthFormatted() {
    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    return `${month}`;
}
export function getCurrentYearFormatted() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    return `${year}`;
}


