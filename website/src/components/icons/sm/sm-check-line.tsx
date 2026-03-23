import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmCheckLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M8.93576 19.5L2 12.3463L3.47869 10.8211L8.93576 16.4497L20.5213 4.5L22 6.02516L8.93576 19.5Z" fill="currentColor"/>
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

SmCheckLineIcon.displayName = "SmCheckLineIcon";

export { SmCheckLineIcon };
