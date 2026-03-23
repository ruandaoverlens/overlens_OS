import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmCalendarSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M21 10.5006V19.5006C20.9998 20.3253 20.325 21 19.5004 21.0003H4.49963C3.67491 21.0001 3.00018 20.3254 3 19.5006V10.5006H21ZM16.5 14.2503C15.255 14.2503 14.25 15.2553 14.25 16.5003C14.25 17.7453 15.255 18.7503 16.5 18.7503C17.745 18.7502 18.75 17.7452 18.75 16.5003C18.75 15.2553 17.7449 14.2503 16.5 14.2503Z" fill="currentColor"/>
<path d="M8.25037 3.00027V5.25027H15.7496V3.00027H17.9996V5.25027H19.5004C20.325 5.25053 20.9998 5.92523 21 6.74991V8.99991H3V6.74991C3.0002 5.92519 3.67492 5.25047 4.49963 5.25027H6.00037V3.00027H8.25037Z" fill="currentColor"/>
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

SmCalendarSolidIcon.displayName = "SmCalendarSolidIcon";

export { SmCalendarSolidIcon };
