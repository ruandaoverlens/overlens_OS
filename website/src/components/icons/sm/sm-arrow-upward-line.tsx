import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowUpwardLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M11.25 20V6.85L5.05003 13.05L4.00003 12L12 4L20 12L18.95 13.05L12.75 6.85V20H11.25Z" fill="currentColor"/>
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

SmArrowUpwardLineIcon.displayName = "SmArrowUpwardLineIcon";

export { SmArrowUpwardLineIcon };
