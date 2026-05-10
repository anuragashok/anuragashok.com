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
      <text
        x="1"
        y="26"
        fontFamily="var(--font-serif)"
        fontWeight="500"
        fontSize="28"
        fill="currentColor"
      >
        a
      </text>
      <circle cx="25" cy="25" r="2.5" fill="var(--accent)" />
    </svg>
  );
}
