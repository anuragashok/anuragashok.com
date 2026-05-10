type Props = { size?: number; className?: string };

export function Logo({ size = 24, className }: Props) {
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
        x="2"
        y="24"
        fontFamily="var(--font-serif)"
        fontWeight="500"
        fontSize="24"
        fill="currentColor"
      >
        a
      </text>
      <circle cx="22" cy="23" r="2" fill="var(--accent)" />
    </svg>
  );
}
