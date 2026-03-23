import { forwardRef } from "react";
import type { SVGProps } from "react";

const SmArrowDownIosLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M12 17L4 9.18863L5.23705 8L12 14.6035L18.763 8L20 9.18863L12 17Z" fill="currentColor"/>
    </svg>
  )
);

SmArrowDownIosLineIcon.displayName = "SmArrowDownIosLineIcon";

export { SmArrowDownIosLineIcon };
