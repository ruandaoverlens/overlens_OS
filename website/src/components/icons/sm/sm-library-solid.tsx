import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmLibrarySolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M21 18.0123L17.3503 19.5003L13.9292 10.8492L17.5778 9.36122L21 18.0123Z" fill="currentColor"/>
<path d="M6.97375 19.3932H3V4.50027H6.97375V19.3932Z" fill="currentColor"/>
<path d="M12.9349 19.3932H8.96118V4.50027H12.9349V19.3932Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24.0003" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmLibrarySolidIcon.displayName = "SmLibrarySolidIcon";

export { SmLibrarySolidIcon };
