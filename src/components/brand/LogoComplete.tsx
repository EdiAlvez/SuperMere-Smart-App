interface LogoCompleteProps {
  width?: number;
  height?: number;
  className?: string;
}

export function LogoComplete({ width = 320, height = 96, className = "" }: LogoCompleteProps) {
  const src = new URL("./SuperMere.svg", import.meta.url).href;

  return (
    <img
      src={src}
      alt="SuperMere logo"
      width={width}
      height={height}
      className={className}
    />
  );
}
