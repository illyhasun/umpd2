import classes from './notification.module.css'

export default function Notification({ loading, error, message }) {
    return (
        (loading || error || message) && (
            <>
                {loading ? <p className={classes.loading}>Loading...</p> : (
                    <>
                        {error && <p className={classes.error}>{error}</p>}
                        {message && <p className={classes.message}>{message}</p>}
                    </>
                )}

            </>
        )
    )
}
