import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * elec-on.svg
 * Bright golden yellow lightning bolt representing electricity ON
 */
export const ElecOnIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Golden yellow lightning bolt */}
    <path
      d="M13.5 2L5.5 12.5H11.5L9 22L18.5 9.5H12.5L13.5 2Z"
      fill="#facc15"
      stroke="#eab308"
      strokeWidth="0.75"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * elec-off.svg
 * Dark/black lightning bolt crossed by a diagonal line representing blackout (electricity OFF)
 */
export const ElecOffIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Dark navy/black lightning bolt */}
    <path
      d="M13.5 2L5.5 12.5H11.5L9 22L18.5 9.5H12.5L13.5 2Z"
      fill="#0f172a"
      stroke="#0f172a"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
    {/* Diagonal slash from top-left to bottom-right */}
    <line
      x1="3"
      y1="3"
      x2="21"
      y2="21"
      stroke="#0f172a"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * elec-maybe.svg
 * Muted grey lightning bolt crossed by a diagonal line representing possible outages or grey zone
 */
export const ElecMaybeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Muted grey lightning bolt */}
    <path
      d="M13.5 2L5.5 12.5H11.5L9 22L18.5 9.5H12.5L13.5 2Z"
      fill="#64748b"
      stroke="#475569"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
    {/* Diagonal slash from top-left to bottom-right */}
    <line
      x1="3"
      y1="3"
      x2="21"
      y2="21"
      stroke="#475569"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Split icon for "Перші 30 хв." (0-30m off, 30-60m on)
 * Combines elec-off / elec-maybe on left with elec-on on right
 */
export const ElecFirst30Icon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left half: Dark crossed bolt */}
    <g clipPath="url(#first-half-clip)">
      <path
        d="M13.5 2L5.5 12.5H11.5L9 22L18.5 9.5H12.5L13.5 2Z"
        fill="#0f172a"
        stroke="#0f172a"
        strokeWidth="0.5"
      />
      <line
        x1="3"
        y1="3"
        x2="21"
        y2="21"
        stroke="#0f172a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
    {/* Right half: Yellow bolt */}
    <g clipPath="url(#second-half-clip)">
      <path
        d="M13.5 2L5.5 12.5H11.5L9 22L18.5 9.5H12.5L13.5 2Z"
        fill="#facc15"
        stroke="#eab308"
        strokeWidth="0.75"
      />
    </g>
    <defs>
      <clipPath id="first-half-clip">
        <rect x="0" y="0" width="12" height="24" />
      </clipPath>
      <clipPath id="second-half-clip">
        <rect x="12" y="0" width="12" height="24" />
      </clipPath>
    </defs>
  </svg>
);

/**
 * Split icon for "Другі 30 хв." (0-30m on, 30-60m off)
 * Combines elec-on on left with elec-off on right
 */
export const ElecSecond30Icon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left half: Yellow bolt */}
    <g clipPath="url(#second-half-left-clip)">
      <path
        d="M13.5 2L5.5 12.5H11.5L9 22L18.5 9.5H12.5L13.5 2Z"
        fill="#facc15"
        stroke="#eab308"
        strokeWidth="0.75"
      />
    </g>
    {/* Right half: Dark crossed bolt */}
    <g clipPath="url(#second-half-right-clip)">
      <path
        d="M13.5 2L5.5 12.5H11.5L9 22L18.5 9.5H12.5L13.5 2Z"
        fill="#0f172a"
        stroke="#0f172a"
        strokeWidth="0.5"
      />
      <line
        x1="3"
        y1="3"
        x2="21"
        y2="21"
        stroke="#0f172a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
    <defs>
      <clipPath id="second-half-left-clip">
        <rect x="0" y="0" width="12" height="24" />
      </clipPath>
      <clipPath id="second-half-right-clip">
        <rect x="12" y="0" width="12" height="24" />
      </clipPath>
    </defs>
  </svg>
);

// Backward-compatible convenience aliases
export const CrossedBoltIcon = ElecOffIcon;
export const First30Icon = ElecFirst30Icon;
export const Second30Icon = ElecSecond30Icon;
