import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import LoginForm from "@/components/user-service/login/LoginForm";
import { Link } from "react-router-dom";

export default function LoginPage() {
  document.title="Login | PeerPrep";

  return (
    <>
      <PageHeader isLoggedIn={false}/>
      <MainContainer>
        <div className="min-h-screen flex justify-center items-center">
          <div className="bg-gray-100 p-5 rounded-lg w-full max-w-md">
            <p className="text-center font-bold mb-8 text-xl">Welcome to PeerPrep</p>
            <LoginForm/>
            <div className="flex items-center flex-col">
              <Link to='/signup' className="m-1">Don't have an account yet? Signup</Link>
              <Link to='/forgot-password' className="m-1">Forgot your password?</Link>
            </div>
          </div>
        </div>
      </MainContainer>
      <p>[Development information, remove in production] Since currently the backend doesn't implement user role in its responses, for now, you can use "Admin" as username to log into administrator mode (to let the frontend recognize you as an administrator).</p>
    </>
  );
}