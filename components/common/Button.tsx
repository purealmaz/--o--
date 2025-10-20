import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed shadow-lg hover:shadow-primary/30 disabled:shadow-none transform hover:-translate-y-px disabled:transform-none"
    >
      {children}
    </button>
  );
};