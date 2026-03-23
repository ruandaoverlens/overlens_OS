import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowForwardIosLine1Icon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M4 8.68863L5.23705 7.5L12 14.1035L18.763 7.5L20 8.68863L12 16.5L4 8.68863Z" fill="currentColor"/>
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

SmArrowForwardIosLine1Icon.displayName = "SmArrowForwardIosLine1Icon";

export { SmArrowForwardIosLine1Icon };
