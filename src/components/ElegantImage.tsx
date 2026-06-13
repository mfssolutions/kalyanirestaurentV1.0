import { useState, ImgHTMLAttributes } from "react";

interface ElegantImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
}

export function ElegantImage({ src, fallback, alt, className, ...props }: ElegantImageProps) {
  const [errorStatus, setErrorStatus] = useState(false);

  return (
    <img
      src={errorStatus ? fallback : src}
      alt={alt}
      onError={() => {
        if (!errorStatus) {
          setErrorStatus(true);
        }
      }}
      referrerPolicy="no-referrer"
      className={className}
      {...props}
    />
  );
}
