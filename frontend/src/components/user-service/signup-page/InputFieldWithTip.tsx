import { Input } from "@/components/ui/input";
import { ReactNode, useState } from "react";

export default function InputFieldWithTip({children, placeholder, onChange, type} : {children : ReactNode, placeholder : string, onChange : (newValue : string) => void, type : ("text" | "password")}) {
    
    const [displayTipBox, setDisplayTipBox] = useState(false);
    const onMouseEnterHander = () => setDisplayTipBox(true);
    const onMouseLeaveHandler = () => setDisplayTipBox(false);

    return (
      <>
        <div className="flex justify-start flex-row relative">
        <Input onMouseEnter={onMouseEnterHander} onMouseLeave={onMouseLeaveHandler} onChange={evt => onChange(evt.target.value)} type={type} placeholder={placeholder} />
        {displayTipBox && (<div className="absolute left-full ml-1 bg-black text-white p-1 bg-opacity-50 min-w-[300px]">
            {children}
        </div>)}
        </div>
      </>
    );
}