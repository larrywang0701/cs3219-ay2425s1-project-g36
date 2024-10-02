import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function SignupButton({onClick} : {onClick : ()=>void}) {
    return (
      <>
        <div className="flex justify-center m-3"> 
          <button onClick={onClick} className="border bg-orange-300 rounded-lg p-1 flex items-center">
            <ArrowRightIcon/>
            <div>Signup</div>
          </button>
        </div> 
      </>
    )
  }