import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmCloudSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M6.275 20C4.80833 20 3.5625 19.4875 2.5375 18.4625C1.5125 17.4375 1 16.1917 1 14.725C1 13.475 1.4375 12.4125 2.3125 11.5375C3.1875 10.6625 4.25 10.225 5.5 10.225C6.75 10.225 7.8125 10.625 8.6875 11.425C9.5625 12.225 10 13.25 10 14.5H11.5C11.5 13.1167 10.9875 11.8417 9.9625 10.675C8.9375 9.50833 7.49167 8.85833 5.625 8.725C6.04167 7.35833 6.85 6.22917 8.05 5.3375C9.25 4.44583 10.575 4 12.025 4C13.8917 4 15.4708 4.6875 16.7625 6.0625C18.0542 7.4375 18.7 9.06667 18.7 10.95V11.55C19.9333 11.55 20.9583 11.95 21.775 12.75C22.5917 13.55 23 14.5583 23 15.775C23 16.925 22.5833 17.9167 21.75 18.75C20.9167 19.5833 19.925 20 18.775 20H6.275Z" fill="currentColor"/>
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

SmCloudSolidIcon.displayName = "SmCloudSolidIcon";

export { SmCloudSolidIcon };
