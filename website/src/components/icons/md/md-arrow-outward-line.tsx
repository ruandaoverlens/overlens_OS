import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowOutwardLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
  const clipId = useId();
    return (
      <svg
        ref={ref}
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
<g clipPath="url(#${clipId})">
<path d="M24.5417 7.45872V23.4079H22.5915V10.7732L22.5486 10.8152L8.83275 24.53L7.46849 23.1658L21.1843 9.45091L21.2273 9.40794H8.59154V7.45872H24.5417Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="32" height="32" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

MdArrowOutwardLineIcon.displayName = "MdArrowOutwardLineIcon";

export { MdArrowOutwardLineIcon };
