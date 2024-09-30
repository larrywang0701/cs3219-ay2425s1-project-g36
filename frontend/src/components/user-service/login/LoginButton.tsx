import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function LoginButton({onClickFunction} : {onClickFunction : ()=>void}) {
    return (
      <>
        <div className="flex justify-center m-3"> 
          <button onClick={onClickFunction} className="border bg-orange-300 rounded-lg p-1 flex items-center">
            <ArrowRightIcon/>
            <div>Login</div>
          </button>
        </div> 
      </>
    )
  }