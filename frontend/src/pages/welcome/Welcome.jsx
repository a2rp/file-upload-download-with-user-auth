import { NavLink } from "react-router-dom";
import styles from "./styles.module.scss";

const Welcome = () => (
    <section className={styles.container} aria-labelledby="welcome-title">
        <div className={styles.welcomeCard}>
            <p className={styles.eyebrow}>PRIVATE FILE GALLERY</p>
            <h1 id="welcome-title">Your files, in one place.</h1>
            <p>Sign in to upload and manage your files. Share an individual download page with its private access code when you choose.</p>
            <div className={styles.actions}>
                {window.localStorage.getItem("token")
                    ? <NavLink to="/dashboard">Open your gallery</NavLink>
                    : <><NavLink to="/login">Log in</NavLink><NavLink to="/register">Create an account</NavLink></>}
            </div>
        </div>
    </section>
);

export default Welcome;
