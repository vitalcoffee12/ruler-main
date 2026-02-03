import { useState } from "react";

export default function useLoading() {
  const [isLoading, setIsLoading] = useState(false);

  return [
    <>
      <div
        className={`bg-stone-900/20 h-screen w-screen fixed z-99 justify-center items-center top-0 left-0`}
        style={{ display: isLoading ? "flex" : "none" }}
      >
        <div className="text-white">Now Loading...</div>
      </div>
    </>,
    setIsLoading,
  ] as const;
}
