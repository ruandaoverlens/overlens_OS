import { forwardRef } from "react";
import type { SVGProps } from "react";

const MicroShieldIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
<path d="M7.22881 10.8138L11.5805 6.45517L10.3319 5.2046L7.22881 8.31264L5.66808 6.76782L4.43785 8L7.22881 10.8138ZM8 16C6.11769 15.5364 4.56381 14.4802 3.33836 12.8313C2.11279 11.1822 1.5 9.35111 1.5 7.33793V2.41913L8 0L14.5 2.41913V7.33793C14.5 9.35111 13.8872 11.1822 12.6616 12.8313C11.4362 14.4802 9.88231 15.5364 8 16Z" fill="currentColor"/>
    </svg>
  )
);

MicroShieldIcon.displayName = "MicroShieldIcon";

export { MicroShieldIcon };
