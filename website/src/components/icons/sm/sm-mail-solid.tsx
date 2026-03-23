import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmMailSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M4.20917 20.0003C3.59734 20.0003 3.07615 19.7882 2.64559 19.364C2.2152 18.9399 2 18.4265 2 17.8237V6.19999C2 5.59086 2.2152 5.07196 2.64559 4.64329C3.07615 4.21461 3.59734 4.00027 4.20917 4.00027H19.7673C20.3856 4.00027 20.9123 4.21461 21.3474 4.64329C21.7825 5.07196 22 5.59086 22 6.19999V17.8237C22 18.4265 21.7825 18.9399 21.3474 19.364C20.9123 19.7882 20.3856 20.0003 19.7673 20.0003H4.20917ZM11.9882 13.1696L19.7673 8.00606V6.19999L11.9882 11.2477L4.20917 6.19999V8.00606L11.9882 13.1696Z" fill="currentColor"/>
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

SmMailSolidIcon.displayName = "SmMailSolidIcon";

export { SmMailSolidIcon };
