import { Input } from "@/components/ui/input";
import { PersonIcon } from "@radix-ui/react-icons";

export default function UsernameInputField({onChangedCallback} : {onChangedCallback : (newValue : string)=>void}) {
  return (
    <>
      <div className="flex items-center m-3">
        <PersonIcon className="m-2"/>
        <Input onChange = {evt => onChangedCallback(evt.target.value)} type="text" className="border w-full" placeholder="Username / E-mail" />
      </div>
    </>
  )
}