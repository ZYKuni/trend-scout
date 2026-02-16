import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";

export default function Home() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <ChatArea />
      </div>
    </div>
  );
}
