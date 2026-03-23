import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowBackIosNewLine1Icon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M4 15.312L12 7.5L20 15.312L18.763 16.5L12 9.8999L5.23705 16.5L4 15.312Z" fill="currentColor"/>
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

SmArrowBackIosNewLine1Icon.displayName = "SmArrowBackIosNewLine1Icon";

export { SmArrowBackIosNewLine1Icon };
