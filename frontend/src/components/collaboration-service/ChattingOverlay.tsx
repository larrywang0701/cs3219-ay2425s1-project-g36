import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatBubbleIcon, Cross1Icon } from "@radix-ui/react-icons";
import ChatBubble from "./ChatBubble";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useAuth } from "@/contexts/AuthContext";

type ChatMessage = {
  message: string,
  isSelf: boolean,
}

type ServerSideChatMessage = {
  userId: string,
  message: string,
}

export default function ChattingOverlay({otherUserName} : {otherUserName : string}) {
  const [displayChattingPanel, setDisplayChattingPanel] = useState(true);
  const [messageInInputBox, setMessageInInputBox] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const addChatMessage = (newMessage: ChatMessage) => {
    const newChatMessages = chatMessages.concat(newMessage);
    setChatMessages(newChatMessages);
  }

  const { auth } = useAuth();

  const { socketState } = useCollaborationContext();
  const { socket } = socketState;

  useEffect(()=>{
    if (socket === null) {
      return;
    }
    socket.once("receive-chat-message", (chatMessage : ServerSideChatMessage) => {
      const isSelf = chatMessage.userId === auth.id;
      addChatMessage({message: chatMessage.message, isSelf: isSelf});
    })
  })

  const sendChatMessage = () => {
    if (socket === null) {
      return;
    }
    if(messageInInputBox === "") {
      return;
    }
    socket.emit("send-chat-message", {message: messageInInputBox, userId: auth.id});
    addChatMessage({message: messageInInputBox, isSelf: true});
    setMessageInInputBox("");
  }

  const renderChattingButton = () => {
    return (
      <>
        <div className="absolute bottom-20 left-20 w-20 h-20 pointer-events-auto">
          <Button className="bg-blue-400 hover:bg-blue-300 w-full h-full rounded-full" onClick={()=>setDisplayChattingPanel(true)}>
            <ChatBubbleIcon className="w-3/4 h-3/4" />
          </Button>
        </div>
      </>
    );
  }

  const renderChattingPanel = () => {
    return(
      <>
        <div className="absolute w-1/5 h-1/2 p-3 border rounded-lg bg-gray-200 pointer-events-auto" style={{left: "50px", bottom: "50px"}}>
          <div className="flex flex-row justify-between items-center w-[calc(100%+1.5rem)] bg-gray-500 -ml-3 -mr-3 -mt-3 rounded-lg pl-1">
            <p className="text-white">Chat with {otherUserName}</p>
            <Button className="bg-red-300 hover:bg-red-200" onClick={()=>setDisplayChattingPanel(false)}><Cross1Icon/></Button>
          </div>
          <div className="flex flex-col w-full h-[calc(100%-5.5rem)] overflow-y-auto">
            {chatMessages.map((chatMessage, index) => <ChatBubble key={`chat_bubble_${index}`} text={chatMessage.message} isSelf={chatMessage.isSelf}/>)}
          </div>
          <form onSubmit={e =>{e.preventDefault(); sendChatMessage()}} className="flex flex-row space-x-2 w-full h-12 mt-5 p-2">
            <Input className="bg-white" onChange={e=>setMessageInInputBox(e.target.value)} value={messageInInputBox} placeholder="Enter your message here..."/>
            <Button className="btngreen" onClick={() => sendChatMessage()}><SendIcon/></Button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50">
        {displayChattingPanel ? renderChattingPanel() : renderChattingButton()}
      </div>
    </>
  );
}