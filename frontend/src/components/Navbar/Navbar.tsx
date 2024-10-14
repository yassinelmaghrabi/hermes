import React from 'react';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <div className={styles.navBar}>
      <input className={styles.search} type="text" placeholder="Search Here" />
      <div className={styles.rightSide}>
        <i className={`fa-regular fa-message ${styles.notification}`}></i>
        <i className={`fa-solid fa-bell ${styles.notification}`}></i>
        <img
          src="WhatsApp Image 2024-10-12 at 10.30.14 AM.jpeg"
          className={styles.userPic}
          alt="user"
        />
      </div>
    </div>
  );
};

export default Navbar;