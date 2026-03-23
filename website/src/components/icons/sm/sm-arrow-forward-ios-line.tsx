import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowForwardIosLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M9.18863 20L8 18.763L14.6035 12L8 5.23705L9.18863 4L17 12L9.18863 20Z" fill="currentColor"/>
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

SmArrowForwardIosLineIcon.displayName = "SmArrowForwardIosLineIcon";

export { SmArrowForwardIosLineIcon };
