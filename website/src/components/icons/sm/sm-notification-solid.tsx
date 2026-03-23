import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmNotificationSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M16.6997 19.3446V21.0003H7.30034V19.3446H16.6997Z" fill="currentColor"/>
<path d="M11.9995 3.00027C15.352 3.00027 18.0701 5.87185 18.0701 9.41409V13.4054L20 17.4836H4L5.92993 13.4054V9.41409C5.92993 5.87195 8.64714 3.00044 11.9995 3.00027Z" fill="currentColor"/>
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

SmNotificationSolidIcon.displayName = "SmNotificationSolidIcon";

export { SmNotificationSolidIcon };
