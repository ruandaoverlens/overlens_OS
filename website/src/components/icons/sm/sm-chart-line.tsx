import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmChartLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M4.3091 19.6909H6.43187V11.0375H10.3715V3.95568H16.1125V7.88755H20.0443V19.6909H21.5V21.5H2.5V2.5H4.3091V19.6909ZM16.1125 19.6909H18.2352V9.69665H16.1125V19.6909ZM8.24097 19.6898H10.3637V12.8466H8.24097V19.6898ZM12.1806 19.6898H14.3033V5.76478H12.1806V19.6898Z" fill="currentColor"/>
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

SmChartLineIcon.displayName = "SmChartLineIcon";

export { SmChartLineIcon };
