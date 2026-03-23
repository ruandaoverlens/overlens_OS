import { forwardRef } from "react";
import type { SVGProps } from "react";

const MdMinusLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<rect x="5.5" y="14.8" width="21" height="2.4" fill="white"/>
    </svg>
  )
);

MdMinusLineIcon.displayName = "MdMinusLineIcon";

export { MdMinusLineIcon };
