import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowUpwardLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M26.6312 15.9994L25.2669 17.3646L16.9749 9.07259V26.6419H15.0247V9.07259L14.9827 9.11556L6.73275 17.3636L5.36849 15.9994L15.9993 5.36849L26.6312 15.9994Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowUpwardLineIcon.displayName = "MdArrowUpwardLineIcon";

export { MdArrowUpwardLineIcon };
