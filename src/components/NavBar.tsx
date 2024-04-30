import Link from 'next/link';

import styles from '../styles/components/NavBar.module.css';


const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarNav}>
        <li className={styles.navItem}>
          <Link legacyBehavior href="/">Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link legacyBehavior href="/moda">Moda</Link>
        </li>
        <li className={styles.navItem}>
          <Link legacyBehavior href="/media">Média</Link>
        </li>
        <li className={styles.navItem}>
          <Link legacyBehavior href="/mediana">Mediana</Link>
        </li>
        <li className={styles.navItem}>
          <Link legacyBehavior href="/passa-alta">Passa Alta</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;