import { ChatWidget } from "@/components/ChatWidget";

const Widget = () => {
  return (
    <main className="min-h-screen bg-transparent">
      {/*
        This route is intended to be embedded in an iframe (v1 loader).
        The ChatWidget itself handles postMessage resizing.
      */}
      <ChatWidget />
    </main>
  );
};

export default Widget;
