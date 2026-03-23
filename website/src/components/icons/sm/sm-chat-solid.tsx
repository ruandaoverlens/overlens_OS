import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmChatSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M19.4344 4.00027C20.2986 4.00044 20.9998 4.71389 21 5.59404V15.9568C20.9997 16.8369 20.2986 17.5504 19.4344 17.5506H14.4104L12.8976 19.5506C12.4439 20.1502 11.5562 20.1501 11.1024 19.5506L9.5896 17.5506H4.56555C3.70133 17.5506 3.00033 16.8369 3 15.9568V5.59404C3.00019 4.71381 3.70125 4.0003 4.56555 4.00027H19.4344ZM7.92297 9.57955C7.383 9.57992 6.94519 10.0262 6.94519 10.5762C6.94528 11.1262 7.38305 11.5714 7.92297 11.5718C8.4632 11.5718 8.90177 11.1264 8.90186 10.5762C8.90186 10.026 8.46325 9.57955 7.92297 9.57955ZM12.1956 9.57955C11.6553 9.5796 11.2167 10.026 11.2167 10.5762C11.2168 11.1264 11.6554 11.5717 12.1956 11.5718C12.7357 11.5716 13.1733 11.1263 13.1733 10.5762C13.1733 10.026 12.7357 9.57969 12.1956 9.57955ZM16.467 9.57955C15.9269 9.57968 15.4893 10.026 15.4893 10.5762C15.4893 11.1263 15.9269 11.5716 16.467 11.5718C17.0072 11.5717 17.4447 11.1264 17.4448 10.5762C17.4448 10.026 17.0073 9.57961 16.467 9.57955Z" fill="currentColor"/>
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

SmChatSolidIcon.displayName = "SmChatSolidIcon";

export { SmChatSolidIcon };
