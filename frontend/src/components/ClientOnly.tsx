'use client';

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

interface ClientOnlyProps {
  children: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    Modal.setAppElement('body');
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // You can return null or a loading placeholder here if needed
    return null;
  }

  return <>{children}</>;
};

export default ClientOnly; 