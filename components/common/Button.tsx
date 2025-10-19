import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg bg-primary-600 text-primary-foreground font-bold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 ease-in-out disabled:bg-foreground/30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
};
