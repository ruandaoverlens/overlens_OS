import { forwardRef } from "react";
import type { SVGProps } from "react";

const SmMoreLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
<circle cx="7.5" cy="12" r="1.35" fill="currentColor"/>
<circle cx="12" cy="12" r="1.35" fill="currentColor"/>
<circle cx="16.5" cy="12" r="1.35" fill="currentColor"/>
    </svg>
  )
);

SmMoreLineIcon.displayName = "SmMoreLineIcon";

export { SmMoreLineIcon };
