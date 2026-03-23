import { forwardRef } from "react";
import type { SVGProps } from "react";

const SmDockToRightLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.75"/>
  <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="1.75"/>
    </svg>
  )
);

SmDockToRightLineIcon.displayName = "SmDockToRightLineIcon";

export { SmDockToRightLineIcon };
