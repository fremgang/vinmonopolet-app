// src/components/TransitionWrapper.tsx
import React, { forwardRef } from 'react';

interface TransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any; // For any other props
}

// This component helps wrap other components that don't handle refs properly
// to be used with Headless UI's Transition component
const TransitionWrapper = forwardRef<HTMLDivElement, TransitionWrapperProps>(
  ({ children, className = '', ...rest }, ref) => {
    return (
      <div ref={ref} className={className} {...rest}>
        {children}
      </div>
    );
  }
);

TransitionWrapper.displayName = 'TransitionWrapper';

export default TransitionWrapper;