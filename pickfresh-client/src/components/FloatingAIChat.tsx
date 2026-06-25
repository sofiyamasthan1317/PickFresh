import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { messages } from "../utils/mockData";
import { Button, Input, Popover } from "./ui";

export const FloatingAIChat = () => {
  const [value, setValue] = useState("");

  return (
    <div className="fixed bottom-5 right-5 z-30">
      <Popover
        trigger={<Button size="lg" className="rounded-full shadow-soft"><Bot className="h-5 w-5" /> AI Assistant</Button>}
      >
        <div className="space-y-4">
          <div>
            <p className="font-bold">PickFresh AI</p>
            <p className="text-sm muted-copy">Recipes, nutrition, shopping lists, and image search.</p>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={message.sender === "customer" ? "ml-8 rounded-2xl bg-primary-600 p-3 text-sm text-white" : "mr-8 rounded-2xl bg-slate-100 p-3 text-sm dark:bg-white/10"}>
                {message.body}
              </div>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={(event) => event.preventDefault()}>
            <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ask for dinner ideas" />
            <Button size="icon" aria-label="Send message"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </Popover>
    </div>
  );
};
