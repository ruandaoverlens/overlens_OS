import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdFilterLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M22 25H10V23H22V25Z" fill="currentColor"/>
<path d="M25 17H7V15H25V17Z" fill="currentColor"/>
<path d="M29 9H3V7H29V9Z" fill="currentColor"/>
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

MdFilterLineIcon.displayName = "MdFilterLineIcon";

export { MdFilterLineIcon };
