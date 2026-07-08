import { Send, Smile, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Seo } from "../../../components/Seo";
import { Badge, Button, Card, Input } from "../../../components/ui";
import { api } from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";
import { useSocket } from "../../../providers/SocketProvider";

type ChatConversation = {
  _id: string;
  lastMessage: string;
  lastMessageAt: string;
  participants: Array<{ _id: string; name: string; role: string }>;
};

type ChatMessageItem = {
  _id: string;
  conversation: string;
  sender: string;
  receiver: string;
  message: string;
  createdAt: string;
  isSeen?: boolean;
};

export const ChatPage = () => {
  const user = useAuthStore((state) => state.user);
  const socket = useSocket();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [text, setText] = useState("");
  const [typing] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeConversationData = useMemo(() => conversations.find((conversation) => conversation._id === activeConversation), [activeConversation, conversations]);

  useEffect(() => {
    const loadConversations = async () => {
      const response = await api.get("/chat/conversations");
      const list = response.data?.data || [];
      setConversations(list);
      if (list[0]?._id) setActiveConversation(list[0]._id);
    };
    void loadConversations();
  }, []);

  useEffect(() => {
    if (!activeConversation) return;
    const loadMessages = async () => {
      const response = await api.get(`/chat/messages/${activeConversation}`);
      setMessages(response.data?.data || []);
    };
    void loadMessages();
  }, [activeConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return undefined;
    const onMessage = (payload: { conversationId: string; message: ChatMessageItem }) => {
      setMessages((current) => [...current, payload.message]);
      setConversations((current) => current.map((conversation) => conversation._id === payload.conversationId ? { ...conversation, lastMessage: payload.message.message, lastMessageAt: payload.message.createdAt } : conversation));
    };
    socket.on("chat-message", onMessage);
    return () => {
      socket.off("chat-message", onMessage);
    };
  }, [socket]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || !activeConversationData) return;
    const receiver = activeConversationData.participants[0]?._id;
    if (!receiver) return;
    try {
      const response = await api.post("/chat/send", { receiverId: receiver, message: text });
      setMessages((current) => [...current, response.data.data]);
      setText("");
      socket?.emit("typing", { conversationId: activeConversation });
    } catch {
      toast.error("Unable to send message right now");
    }
  };

  return (
    <section className="container-px py-8">
      <Seo title="Realtime chat" description="Customer support, vendor collaboration, and live messaging." />
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="p-5">
          <h1 className="text-2xl font-black">Chats</h1>
          <div className="mt-4 space-y-2">
            {conversations.map((conversation) => {
              const participant = conversation.participants[0];
              return (
                <button key={conversation._id} type="button" onClick={() => setActiveConversation(conversation._id)} className={`w-full rounded-2xl border p-3 text-left ${activeConversation === conversation._id ? "border-primary-500 bg-primary-50" : "border-slate-200 dark:border-white/10"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{participant?.name ?? "Support"}</span>
                    <Badge>{participant?.role ?? "chat"}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm muted-copy">{conversation.lastMessage}</p>
                </button>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
            <div>
              <h2 className="font-black">{activeConversationData?.participants[0]?.name ?? "Support"}</h2>
              <p className="text-sm muted-copy">{typing ? "Typing..." : "Online now"}</p>
            </div>
            <Badge>Realtime</Badge>
          </div>
          <div className="mt-5 h-[460px] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            {messages.map((message) => {
              const isMine = message.sender === user?.id;
              return (
                <div key={message._id} className={`max-w-md ${isMine ? "ml-auto" : "mr-auto"}`}>
                  <div className={`rounded-2xl p-3 text-sm ${isMine ? "bg-primary-600 text-white" : "bg-white text-slate-800 dark:bg-white/10 dark:text-white"}`}>
                    <p>{message.message}</p>
                  </div>
                  <p className="mt-1 text-xs opacity-70">{new Date(message.createdAt).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" })}</p>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form className="mt-4 flex gap-2" onSubmit={sendMessage}>
            <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a message" />
            <Button type="button" variant="outline" size="icon" aria-label="Attach image"><Upload className="h-4 w-4" /></Button>
            <Button type="button" variant="outline" size="icon" aria-label="Emoji"><Smile className="h-4 w-4" /></Button>
            <Button type="submit" size="icon" aria-label="Send"><Send className="h-4 w-4" /></Button>
          </form>
        </Card>
      </div>
    </section>
  );
};
