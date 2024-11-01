import { PersonIcon } from "@radix-ui/react-icons";

export default function ChatBubble({text, isSelf} : {text : string, isSelf : boolean}) {
  return(
    <>
      <div className={`flex flex-row items-start w-full justify-${isSelf ? "end" : "start"} ${isSelf ? "flex-row-reverse" : ""}`}>
        <div className="rounded-full bg-white m-2">
            <PersonIcon className="m-2"/>
        </div>
        <div className={`rounded-lg max-w-full p-2 mt-3 text-lg overflow-hidden bg-${isSelf ? "green-200" : "white"} break-words text-${isSelf ? "right" : "left"}`}>
          {text}
        </div>
      </div>
    </>
  );
}