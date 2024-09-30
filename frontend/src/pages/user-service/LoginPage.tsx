import PageHeader from "@/components/common/PageHeader";
import LoginForm from "@/components/user-service/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = ( isAdmin: boolean ) => {
    login(isAdmin);
    navigate('/');
  }

  document.title="Login | PeerPrep";

  return (
    <>
      <PageHeader isLoggedIn={false}/>
      <LoginForm/>
    </>
  );
}