import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StaffLanding({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/staff/dashboard");
  }, []);

  return null;
}