import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmNotificationOnSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M16.1374 21.0003H6.41437V19.3644H16.1374V21.0003Z" fill="currentColor"/>
<path d="M10.9321 3.21231C11.9941 3.15357 13.0538 3.36851 14.0113 3.83633C13.5624 4.53833 13.3019 5.37474 13.3019 6.2731C13.302 7.43122 13.7443 8.54501 14.5368 9.38223C15.3293 10.2192 16.4107 10.7151 17.5562 10.7676V13.4922L19.5529 17.5231H3L4.99553 13.4922V9.54593C4.99526 8.47191 5.26524 7.41511 5.78003 6.47525C6.29478 5.53548 7.03776 4.74317 7.93877 4.17252C8.83985 3.60189 9.87 3.27109 10.9321 3.21231Z" fill="currentColor"/>
<path d="M17.7586 3.00027C18.6182 3.00036 19.4423 3.3457 20.0501 3.95938C20.6578 4.57312 21 5.40522 21 6.2731C21 7.141 20.6579 7.9731 20.0501 8.58682C19.4423 9.2005 18.6182 9.54585 17.7586 9.54593C16.899 9.54593 16.0739 9.20058 15.4661 8.58682C14.8584 7.97312 14.5173 7.14088 14.5173 6.2731C14.5173 5.40533 14.8585 4.57309 15.4661 3.95938C16.0739 3.34563 16.899 3.00027 17.7586 3.00027Z" fill="currentColor"/>
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

SmNotificationOnSolidIcon.displayName = "SmNotificationOnSolidIcon";

export { SmNotificationOnSolidIcon };
