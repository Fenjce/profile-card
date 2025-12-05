interface ProfileCardSkeletonProps {
  theme: "light" | "dark";
}

export default function ProfileCardSkeleton({
  theme,
}: ProfileCardSkeletonProps) {
  return (
    <>
      {/* Avatar skeleton */}
      <div className="avatar-section">
        <div className="avatar-container">
          <div className={`skeleton skeleton-avatar ${theme}`}></div>
          <div className="avatar-border"></div>
        </div>
      </div>

      {/* User info skeleton */}
      <div className="user-info-section">
        <div className={`skeleton skeleton-name ${theme}`}></div>
        <div className={`skeleton skeleton-title ${theme}`}></div>
        <div className={`skeleton skeleton-content-line ${theme}`}></div>
        <div className={`skeleton skeleton-content-line ${theme}`}></div>
        <div className={`skeleton skeleton-content-line short ${theme}`}></div>
      </div>

      {/* Email button skeleton */}
      <div className="email-section">
        <div className={`skeleton skeleton-button ${theme}`}></div>
      </div>

      {/* Social icons skeleton */}
      <div className="social-section">
        <div className={`skeleton skeleton-social ${theme}`}></div>
        <div className={`skeleton skeleton-social ${theme}`}></div>
        <div className={`skeleton skeleton-social ${theme}`}></div>
        <div className={`skeleton skeleton-social ${theme}`}></div>
      </div>
    </>
  );
}
