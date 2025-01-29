import classes from './doctorInfo.module.css'

export default function DoctorInfo({doctor, workingTime, workingMode}) {
    return (
        <div className={classes.doctorInfo}>
            <h1>{doctor?.name}</h1>
            <p>{doctor?.personalNumber}</p>
            <p>{workingTime?.timeName === '1' ? 'Plný úvazek' : 'Zkrácený úvazek'}</p>
            <p>{workingTime?.number}</p>
            <p>{workingMode?.modeName === '1' ? 'RRPD' : 'NRPD'}</p>
        </div>
    )
}
