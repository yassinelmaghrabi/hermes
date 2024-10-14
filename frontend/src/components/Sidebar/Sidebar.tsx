import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img className={styles.logoImg} src="2n4DrOxGUazE6S7O9DkjRJLQuYe.svg" alt="" />
        <h2>HERMES</h2>
      </div>
      <nav className={styles.nav}>
        <NavItem icon="fa-solid fa-chalkboard-user" text="Tribunes" />
        <NavItem icon="fa-regular fa-comment-dots" text="Chat" />
        <NavItem icon="fa-solid fa-list" text="ToDo" />
        <NavItem icon="fa-solid fa-people-group" text="Crew" />
        <NavItem icon="fa-solid fa-people-group" text="Calender" />
        <NavItem icon="fa-solid fa-inbox" text="Archive" />
        <NavItem icon="fa-solid fa-star-half-stroke" text="Activites" />
        <NavItem icon="fa-solid fa-gear" text="Settings" />
        <hr className={styles.divider} />
        <NavItem icon="fa-solid fa-arrow-right-from-bracket" text="Sign Out" />
        <NavItem icon="fa-solid fa-circle-info" text="Help" />
      </nav>
    </aside>
  );
};

interface NavItemProps {
  icon: string;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text }) => (
  <div className={styles.navElement}>
    <a href="#">
      <i className={icon}></i>
      {text}
    </a>
  </div>
);

export default Sidebar;