import { forwardRef } from "react";
import type { SVGProps } from "react";

const MdMoreLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
<circle cx="10" cy="16" r="2.5" fill="currentColor"/>
<circle cx="16" cy="16" r="2.5" fill="currentColor"/>
<circle cx="22" cy="16" r="2.5" fill="currentColor"/>
    </svg>
  )
);

MdMoreLineIcon.displayName = "MdMoreLineIcon";

export { MdMoreLineIcon };
