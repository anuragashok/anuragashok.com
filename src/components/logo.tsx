type Props = { size?: number; className?: string };

export function Logo({ size = 28, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Anurag Ashok"
      className={className}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      <text
        x="5"
        y="22"
        fontFamily="var(--font-serif)"
        fontWeight="500"
        fontSize="26"
        fill="currentColor"
      >
        a
      </text>
      <circle cx="23" cy="21" r="2.5" fill="var(--accent)" />
    </svg>
  );
}
