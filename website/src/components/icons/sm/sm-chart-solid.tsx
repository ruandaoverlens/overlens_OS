import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmChartSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M4.3091 19.6909H6.43187V11.0375H10.3715V3.95568H16.1125V7.88755H20.0443V19.6909H21.5V21.5H2.5V2.5H4.3091V19.6909Z" fill="currentColor"/>
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

SmChartSolidIcon.displayName = "SmChartSolidIcon";

export { SmChartSolidIcon };
