import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowDownwardLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M11.25 4V17.15L5.05003 10.95L4.00003 12L12 20L20 12L18.95 10.95L12.75 17.15V4H11.25Z" fill="currentColor"/>
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

SmArrowDownwardLineIcon.displayName = "SmArrowDownwardLineIcon";

export { SmArrowDownwardLineIcon };
