import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import CustomCursor from "./pages/CustomCursor";
import Layout from "./components/Layout/Layout";
import CreateUser from "./pages/login/CreateUser";
import UserManagement from "./pages/login/UserManagement";


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
      </Routes>
    </Router>
  );
}

export default App;
