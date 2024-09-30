import { useState } from "react";
import MainContainer from "../../common/MainContainer";
import LoginButton from "./LoginButton";
import PasswordInputField from "./PasswordInputField";
import UsernameInputField from "./UsernameInputField";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";

export default function LoginForm(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [displayedLoginMessage, setDisplayedLoginMessage] = useState<DisplayedMessage | null>(null);
    const showDisplayedLoginMessage = (message : string, type : DisplayedMessageTypes) => {
        setDisplayedLoginMessage({message : message, type : type});
    }
    const startLoggingIn = (username : string, password : string) => {
        if(username === "" || password === "") {
            showDisplayedLoginMessage("Username or password cannot be empty.", DisplayedMessageTypes.Warning);
            return;
        }
        showDisplayedLoginMessage("Logging in...", DisplayedMessageTypes.Info);
        // todo
    }
    return(
        <>
          <MainContainer>
            <div className="rounded-lg min-h-screen flex justify-center items-center bg-gray-200">
              <div className="bg-white p-5 rounded-lg w-full max-w-md">
                <p className="text-center font-bold mb-8 text-xl">Welcome to PeerPrep</p>
                <UsernameInputField onChangedCallback={setUsername}/>
                <PasswordInputField onChangedCallback={setPassword}/>
                <DisplayedMessageContainer displayedMessage={displayedLoginMessage} />
                <LoginButton onClickFunction={() => startLoggingIn(username, password)}/>
              </div>
            </div>
          </MainContainer>
        </>
    )
}