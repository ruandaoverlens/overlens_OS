import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmAlertSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M12.0121 3.00118C12.473 3.00068 12.9268 3.11351 13.33 3.33215C13.7338 3.55117 14.0729 3.8683 14.3166 4.25177L22.6131 17.2612L22.7014 17.4089C22.8963 17.7623 22.9993 18.1582 23 18.5614V18.5638C22.9999 19.21 22.7371 19.8302 22.2697 20.2872C21.8023 20.744 21.1679 20.9999 20.5069 20.9999H3.51121C3.1862 21.0023 2.86372 20.9425 2.5621 20.8238C2.25588 20.7033 1.97734 20.5245 1.74236 20.2978C1.50736 20.0711 1.32081 19.8013 1.19345 19.5035C1.06614 19.2058 1.00003 18.8864 1 18.5638V18.5614C1.00081 18.101 1.13485 17.6501 1.3869 17.2612L9.70158 4.25059C9.9452 3.86736 10.2858 3.55107 10.6894 3.33215C11.0922 3.11375 11.5455 3.0008 12.006 3.00118H12.0097L12.0133 3L12.0121 3.00118ZM11.0195 16.0898V18.26H12.9999V16.0898H11.0195ZM11.0195 15H12.9999V7.41015H11.0195V15Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmAlertSolidIcon.displayName = "SmAlertSolidIcon";

export { SmAlertSolidIcon };
