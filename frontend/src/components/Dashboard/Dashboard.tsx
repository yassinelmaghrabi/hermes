import React from 'react';
import Navbar from '../Navbar/Navbar';
import Tribune from '../Tribune/Tribune';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboard}>
      <Navbar />
      <div className={styles.tribunesContainer}>
        {[...Array(9)].map((_, index) => (
          <Tribune key={index} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;