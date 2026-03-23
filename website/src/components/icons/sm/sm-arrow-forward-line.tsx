import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowForwardLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17.15 12.75H4.00003V11.25H17.15L10.95 5.05L12 4L20 12L12 20L10.95 18.95L17.15 12.75Z" fill="currentColor"/>
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

SmArrowForwardLineIcon.displayName = "SmArrowForwardLineIcon";

export { SmArrowForwardLineIcon };
