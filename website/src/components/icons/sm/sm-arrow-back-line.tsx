import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowBackLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
  const clipId = useId();
    return (
      <svg
        ref={ref}
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
<g clipPath="url(#${clipId})">
<path d="M6.85003 12.75L13.05 18.95L12 20L4.00003 12L12 4L13.05 5.05L6.85003 11.25H20V12.75H6.85003Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmArrowBackLineIcon.displayName = "SmArrowBackLineIcon";

export { SmArrowBackLineIcon };
