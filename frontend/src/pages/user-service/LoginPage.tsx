import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [userID, setUserID] = useState(0);

  const handleLogin = ( isAdmin: boolean ) => {
    login(userID, isAdmin);
    navigate('/');
  }

  document.title="Login | PeerPrep";

  return (
    <>
      <p>
        This is an empty login page to be filled up.
      </p>
      <div>
        <div>User ID:</div>
        <Input onChange={evt => setUserID(Number.parseInt(evt.target.value))}></Input>
      </div>
      <Button onClick={ () => handleLogin(false) }>Login</Button>
      <Button onClick={ () => handleLogin(true) }>Login as Admin</Button>
    </>
  );
}