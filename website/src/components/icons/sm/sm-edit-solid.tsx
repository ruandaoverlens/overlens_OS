import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmEditSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M9.47577 19.9993L4.83292 20.9551C4.2887 21.0794 3.82633 20.947 3.44534 20.5585C3.0644 20.17 2.92794 19.7039 3.03665 19.16L3.99356 14.5194L9.47577 19.9993Z" fill="currentColor"/>
<path d="M16.7312 3.00027C17.5399 3.0003 18.2322 3.2876 18.8076 3.8627L20.137 5.19203C20.7124 5.76719 21.0005 6.45903 21.0005 7.26734C21.0005 8.07569 20.7124 8.76748 20.137 9.34265L10.8051 18.67L5.32291 13.19L14.6548 3.8627C15.2302 3.28764 15.9225 3.00027 16.7312 3.00027Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24.0005" height="24.0003" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmEditSolidIcon.displayName = "SmEditSolidIcon";

export { SmEditSolidIcon };
