import { forwardRef } from "react";
import type { SVGProps } from "react";

const SmRegisteredLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
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
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M9.5 16.5V7.5H12.75C13.99 7.5 15 8.5 15 9.75C15 11 13.99 12 12.75 12H9.5M12.35 12L15 16.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
);

SmRegisteredLineIcon.displayName = "SmRegisteredLineIcon";

export { SmRegisteredLineIcon };
