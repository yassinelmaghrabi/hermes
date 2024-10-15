
import Sidebar from "../../components/Sidebar/Sidebar";
import styles from '../../components/Layout/Layout.module.css';
import Calendar from "./Calendar";


const CalenderPage: React.FC = () => {
  
  return (

    <div className={styles.container}>
      <Sidebar />
      <Calendar />
      
    </div>
   
    
  );
};

export default CalenderPage;
