import React from 'react';

interface DiamondLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withContainer?: boolean;
}

export const DiamondLoader: React.FC<DiamondLoaderProps> = ({
  size = 'md',
  className = '',
  withContainer = false,
}) => {
  const scaleClass = {
    sm: 'scale-50',
    md: 'scale-75',
    lg: 'scale-100',
  }[size];

  const loaderElement = (
    <div className={`flex items-center justify-center ${scaleClass} ${className}`} aria-label="Loading...">
      <div className="diamond-loader">
        <div className="diamond-loader-inner" />
      </div>
    </div>
  );

  if (withContainer) {
    return (
      <div className="flex h-64 w-full items-center justify-center bg-transparent">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
};
