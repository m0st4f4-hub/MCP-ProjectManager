import React from 'react';
import styles from './ExampleButton.module.css';

interface ExampleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const ExampleButton: React.FC<ExampleButtonProps> = ({ children, variant = 'primary', ...props }) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default ExampleButton; 