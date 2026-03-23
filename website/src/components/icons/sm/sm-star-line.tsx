import { forwardRef } from "react";
import type { SVGProps } from "react";

const SmStarLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M10 2.5L12.09 7.36L17.5 7.94L13.39 11.57L14.58 16.88L10 14.27L5.42 16.88L6.61 11.57L2.5 7.94L7.91 7.36L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
);

SmStarLineIcon.displayName = "SmStarLineIcon";

export { SmStarLineIcon };
