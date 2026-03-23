import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowOutwardLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M6.14397 19.0001L5 17.8561L16.2218 6.6343H5.92607V5.00006H19V18.074H17.3658V7.77827L6.14397 19.0001Z" fill="currentColor"/>
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

SmArrowOutwardLineIcon.displayName = "SmArrowOutwardLineIcon";

export { SmArrowOutwardLineIcon };
