import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../../ui/textarea";
import Markdown from "react-markdown";

export default function QuestionInputField({ name, placeholder, value, setValue } : {
  name : string,
  placeholder : string,
  value : string,
  setValue : ( newValue : string ) => void
}) {

  function QuestionTextarea() {
    return (
      <Textarea 
        id={ "input-" + name } 
        placeholder={ placeholder }
        className="h-[100%] font-mono"
        value={ value }
        onChange={ (event) => setValue(event.target.value) }
      />
    );
  }

  function QuestionPreview() {
    return (
      <div className="h-[100%] rounded-md border border-input prose p-2 overflow-auto border-gray-900">
        <Markdown>
          { value }
        </Markdown>
      </div>
    )
  }

  return (
    <div>
      <label htmlFor={ "input-" + name }>{ name }</label>
      <Tabs defaultValue="code" className="h-[300px]">
        <TabsList className="h-[30px]">
          <strong className="mr-3">View:</strong>
          <TabsTrigger value="code">Markdown</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="both">Markdown + Preview</TabsTrigger>
        </TabsList>
        <TabsContent className="h-[270px]" value="code">
          <QuestionTextarea />
        </TabsContent>
        <TabsContent className="h-[270px]" value="preview">
          <QuestionPreview />
        </TabsContent>
        <TabsContent className="h-[270px]" value="both">
          <div className="flex h-[25px] gap-1">
            <div className="flex-[50%]">
              <strong>Markdown</strong>
            </div>
            <div className="flex-[50%]">
              <strong>Preview</strong>
            </div>
          </div>
          <div className="flex h-[245px] gap-1">
            <div className="flex-[50%]">
              <QuestionTextarea />
            </div>
            <div className="flex-[50%]">
              <QuestionPreview />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}