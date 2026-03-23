import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdNotificationSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M22.0005 24.9766V27H10.0005V24.9766H22.0005Z" fill="currentColor"/>
<path d="M16.0005 5C20.2804 5.0002 23.7504 8.50968 23.7505 12.8389V17.7178L26.2134 22.7012H5.78662L8.25049 17.7178V12.8389C8.2506 8.50956 11.7204 5 16.0005 5Z" fill="currentColor"/>
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

MdNotificationSolidIcon.displayName = "MdNotificationSolidIcon";

export { MdNotificationSolidIcon };
