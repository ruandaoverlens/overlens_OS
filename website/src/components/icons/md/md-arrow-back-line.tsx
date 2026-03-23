import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowBackLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17.3636 6.73274L9.11556 14.9827L9.07259 15.0247H26.6419V16.9749H9.07259L17.3646 25.2669L15.9993 26.6312L5.36849 15.9993L15.9993 5.36848L17.3636 6.73274Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowBackLineIcon.displayName = "MdArrowBackLineIcon";

export { MdArrowBackLineIcon };
