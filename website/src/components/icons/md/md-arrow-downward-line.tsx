import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowDownwardLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M16.9749 5.35873V22.9271L17.0179 22.8841L25.266 14.6351L26.6312 15.9994L15.9993 26.6312L5.36849 15.9994L6.73275 14.6351L14.9827 22.8841L15.0247 22.9271V5.35873H16.9749Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowDownwardLineIcon.displayName = "MdArrowDownwardLineIcon";

export { MdArrowDownwardLineIcon };
