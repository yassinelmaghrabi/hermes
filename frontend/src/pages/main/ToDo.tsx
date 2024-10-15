
import Sidebar from "../../components/Sidebar/Sidebar";
import styles from '../../components/Layout/Layout.module.css';
import ToDoList from "./ToDoList";

const ToDo: React.FC = () => {
  
  return (

    <div className={styles.container}>
      <Sidebar />
      <ToDoList />
    </div>
   
    
  );
};

export default ToDo;
