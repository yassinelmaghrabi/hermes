import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
// import Dashboard from '../Dashboard/Dashboard';
import styles from './Layout.module.css';
import EnrollPage from '../../pages/main/EnrollPage';


const Layout: React.FC = () => {
  return (
    <div className={styles.container}>
      <Sidebar />
      {/* <Dashboard /> */}
      <EnrollPage />
    </div>
  );
};

export default Layout;