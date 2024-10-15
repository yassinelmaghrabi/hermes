import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import CustomCursor from "./pages/CustomCursor";
import Layout from "./components/Layout/Layout";
import CreateUser from "./pages/login/CreateUser";
import UserManagement from "./pages/login/UserManagement";
import ToDo from "./pages/main/ToDo";
import CalenderPage from "./pages/main/CalenderPage";
import LectureTable from "./pages/system/LectureTable";




function App() {
  return (
    <Router>
      <CustomCursor />
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        <Route path="/" element={<Layout />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/user-mangement" element={<UserManagement />} />
        <Route path="/todo" element={<ToDo />} />
        <Route path="/calendar" element={<CalenderPage />} />
        <Route path="/lecture-table" element={<LectureTable username="elsisi" gpa={4.0} />} />
      </Routes>
    </Router>
  );
}

export default App;
