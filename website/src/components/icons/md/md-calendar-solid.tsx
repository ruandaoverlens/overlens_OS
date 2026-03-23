import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdCalendarSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M28 14V26C28 27.1 27.1 27.9999 26 28H6C4.9 28 4 27.1 4 26V14H28ZM22 19C20.34 19 19 20.34 19 22C19 23.66 20.34 25 22 25C23.66 25 25 23.66 25 22C25 20.34 23.6599 19 22 19Z" fill="currentColor"/>
<path d="M11 4V7H21V4H24V7H26C27.1 7.00005 28 7.90003 28 9V12H4V9C4 7.9 4.90001 7 6 7H8V4H11Z" fill="currentColor"/>
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

MdCalendarSolidIcon.displayName = "MdCalendarSolidIcon";

export { MdCalendarSolidIcon };
