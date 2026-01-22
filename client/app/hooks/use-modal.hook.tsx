import React, { useState } from "react";

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    Modal: isOpen
      ? ({ children }: { children?: React.ReactNode }) => (
          <>
            <Modal onClose={closeModal}>{children}</Modal>
          </>
        )
      : () => <></>,
    openModal,
    closeModal,
    isOpen,
  };
}

export function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-stone-900/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-800 rounded-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-0 right-2 text-stone-600 hover:text-stone-900 dark:hover:text-stone-300 p-2 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
