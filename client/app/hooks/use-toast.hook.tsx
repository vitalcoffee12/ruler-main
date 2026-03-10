import { useState } from "react";

export default function useToast(
  
  duration = 3000,
) {
  const [messages, setMessages] = useState<
    { id: number; type: string; message: string }[]
  >([]);

  const addToast = (type: string, message: string) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, duration);
  };

  return [ToastContainer({messages}), addToast] as const;
}

function ToastContainer({
  messages,
}: {
  messages: { id: number; type: string; message: string }[];
}) {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-999">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`px-4 py-2 rounded-md shadow bg-white border-l-10 w-md ${getToastClass(msg.type)}`}
        >
          {msg.message}
        </div>
      ))}
    </div>
  );
}

function getToastClass(type: string) {
  switch (type) {
    case "success":
      return "border-green-500 text-stone-900";
    case "error":
      return "border-red-500 text-stone-900";
    case "info":
      return "border-blue-500 text-stone-900";
    case "warning":
      return "border-yellow-500 text-stone-900";
    default:
      return "border-gray-500 text-stone-900";
  }
}
