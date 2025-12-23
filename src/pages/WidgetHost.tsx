import { useEffect } from "react";
import { ChatWidget } from "@/components/ChatWidget";

const WidgetHost = () => {
  // SEO: this route is meant for iframe embedding; keep it minimal.
  useEffect(() => {
    document.title = "Value Build Homes Chatbot Widget";
  }, []);

  return (
    <main className="min-h-screen bg-transparent">
      <ChatWidget />
    </main>
  );
};

export default WidgetHost;
