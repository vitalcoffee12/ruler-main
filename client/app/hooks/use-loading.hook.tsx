import { useEffect, useRef, useState } from "react";

export default function useLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.display = "none";
        }
      }, 300);
    } else {
      if (ref.current) {
        ref.current.style.display = "flex";
      }
    }
  }, [isLoading]);

  return [
    <div
      className="fixed flex h-full w-full bg-white flex-col justify-center items-center min-h-screen top-0 left-0 z-50 transition-opacity duration-300"
      ref={ref}
      style={{ opacity: isLoading ? 1 : 0 }}
    >
      <div className="loader mb-2"></div>
      Loading...
      <div className="absolute bottom-24">
        <span className="border rounded-md px-2 py-1 mr-2">Tip</span>
        {tips[0]}
      </div>
    </div>,
    setIsLoading,
  ] as const;
}

const tips = [
  "You can access your rulers from any device by logging into your account.",
  "Regularly update your password to keep your account secure.",
  "Use the search feature to quickly find specific rulers in your collection.",
  "Customize your profile to make your account uniquely yours.",
  "Check out our FAQ section for answers to common questions.",
];
