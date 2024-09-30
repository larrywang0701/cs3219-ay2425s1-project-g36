import { useState } from "react";
import MainContainer from "../../common/MainContainer";
import LoginButton from "./LoginButton";
import PasswordInputField from "./PasswordInputField";
import UsernameInputField from "./UsernameInputField";

function startLoggingIn(username : string, password : string) : void{
    console.log(username);
    console.log(password);
}

export default function LoginForm(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    return(
        <>
          <MainContainer>
            <div className="rounded-lg min-h-screen flex justify-center items-center bg-gray-200">
              <div className="bg-white p-5 rounded-lg w-full max-w-md">
                <p className="text-center font-bold mb-8 text-xl">Welcome to Peer Prep</p>
                <UsernameInputField onChangedCallback={setUsername}/>
                <PasswordInputField onChangedCallback={setPassword}/>
                <LoginButton onClickFunction={() => startLoggingIn(username, password)}/>
              </div>
            </div>
          </MainContainer>
        </>
    )
}