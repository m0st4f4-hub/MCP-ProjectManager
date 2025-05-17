"use client";

import { useEffect } from "react";
import Modal from "react-modal";

interface ModalProviderProps {
  children: React.ReactNode;
}

export default function ModalProvider({ children }: ModalProviderProps) {
  useEffect(() => {
    // Set the app element for react-modal
    // In Next.js 13+ App Router, #__next doesn't exist
    // Use document.body instead
    Modal.setAppElement(document.body);
  }, []);

  return <>{children}</>;
}
