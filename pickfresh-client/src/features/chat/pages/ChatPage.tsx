import { io } from "socket.io-client";
import { Circle, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Seo } from "../../../components/Seo";
import { Badge, Button, Card, Input } from "../../../components/ui";
import { messages } from "../../../utils/mockData";

export const ChatPage = () => {
  const [text, setText] = useState("");
  const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000", { autoConnect: false }), []);

  return (
    <section className="container-px py-8">
      <Seo title="Realtime chat" description="Vendor chat, customer support, typing indicator, read receipts, online status and message history." />
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="p-5">
          <h1 className="text-2xl font-black">Chats</h1>
          {["Customer Support", "Vendor Chat", "Delivery Partner"].map((chat) => <div key={chat} className="mt-3 rounded-2xl border border-slate-200 p-3 dark:border-white/10"><div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-primary-600 text-primary-600" />{chat}</div><p className="text-xs muted-copy">Online</p></div>)}
        </Card>
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10"><div><h2 className="font-black">Customer Support</h2><p className="text-sm muted-copy">Typing indicator, read receipts and online status</p></div><Badge>Socket ready</Badge></div>
          <div className="mt-5 h-[460px] space-y-3 overflow-y-auto">
            {messages.map((message) => <div key={message.id} className={message.sender === "customer" ? "ml-auto max-w-md rounded-2xl bg-primary-600 p-3 text-white" : "max-w-md rounded-2xl bg-slate-100 p-3 dark:bg-white/10"}><p className="text-sm">{message.body}</p><p className="mt-1 text-xs opacity-70">{message.createdAt} - {message.read ? "Read" : "Sent"}</p></div>)}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              socket.emit("message", text);
              setText("");
            }}
          >
            <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a message" />
            <Button size="icon" aria-label="Send"><Send className="h-4 w-4" /></Button>
          </form>
        </Card>
      </div>
    </section>
  );
};
