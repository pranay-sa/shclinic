type DoctorBrandLogoProps = {
  className?: string;
};

export function DoctorBrandLogo({ className }: DoctorBrandLogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden>
      <ellipse cx="20" cy="9.5" rx="5.2" ry="7.2" fill="#37d6cc" />
      <ellipse cx="30.5" cy="20" rx="7.2" ry="5.2" fill="#45b8f5" />
      <ellipse cx="20" cy="30.5" rx="5.2" ry="7.2" fill="#34c5ba" />
      <ellipse cx="9.5" cy="20" rx="7.2" ry="5.2" fill="#2f9cdf" />
    </svg>
  );
}
