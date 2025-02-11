import classes from './doctorInfo.module.css'

export default function DoctorInfo({doctor, workingTime, workingMode}) {
    return (
        <div className={classes.doctorInfo}>
            <h1>{`${doctor?.name} ${doctor?.personalNumber}`}</h1>
            <p>{workingTime?.timeName == '1' ? 'Plný úvazek' : `Zkrácený úvazek ${workingTime?.number}`}</p>
            <p>{workingMode?.modeName == '1' ? 'RRPD' : 'NRPD'}</p>
        </div>
    )
}
