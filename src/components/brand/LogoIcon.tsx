interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 40, className = "" }: LogoIconProps) {
  const src = new URL("./LogoSuperMere.svg", import.meta.url).href;

  return (
    <img
      src={src}
      alt="SuperMere icon"
      width={size}
      height={size}
      className={className}
    />
  );
}
