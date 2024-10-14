import React from "react";
import styles from "./Tribune.module.css";

const Tribune: React.FC = () => {
  return (
    <div className={styles.tribune}>
      <img
        className={styles.classImg}
        src="WhatsApp Image 2024-10-12 at 10.30.14 AM.jpeg"
        alt=""
      />
      <h3>SUM24 - IoT (2)</h3>
      <h3>Field Training - Group 2</h3>
    </div>
  );
};

export default Tribune;
