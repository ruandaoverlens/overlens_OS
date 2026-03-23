import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdLibrarySolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M28 23.8955L23.1338 25.8496L18.5713 14.4883L23.4375 12.5342L28 23.8955Z" fill="currentColor"/>
<path d="M9.29883 25.709H4V6.15039H9.29883V25.709Z" fill="currentColor"/>
<path d="M17.2461 25.709H11.9473V6.15039H17.2461V25.709Z" fill="currentColor"/>
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

MdLibrarySolidIcon.displayName = "MdLibrarySolidIcon";

export { MdLibrarySolidIcon };
