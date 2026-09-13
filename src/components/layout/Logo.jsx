export default function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="36" height="36" rx="11" fill="#0F6E56" />
      <circle cx="16.5" cy="21" r="8" fill="#FFFFFF" fillOpacity="0.92" />
      <circle cx="24.5" cy="21" r="8" fill="#FFFFFF" fillOpacity="0.7" />
      <circle cx="27.5" cy="11.5" r="3.5" fill="#7F77DD" />
    </svg>
  );
}
