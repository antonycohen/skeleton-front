export const AppLogo = ({
  className,
}: {
  className?: string;
}) => {
  // Logo files are served from each app's `public/` folder.
  return (
    <div
      className={`flex h-[32px] items-center gap-2 flex-row ${className ?? ''}`}
    >
      <img src="/logo-icon.svg" alt="" className="h-full w-auto" />
      <img src="/logo-text.svg" alt="Skeleton" className="h-5 w-auto" />
    </div>
  );
};
