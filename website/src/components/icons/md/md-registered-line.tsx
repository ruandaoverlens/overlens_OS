import { forwardRef } from "react";
import type { SVGProps } from "react";

const MdRegisteredLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12.7 22V10H17C18.7 10 20 11.3 20 13C20 14.7 18.7 16 17 16H12.7M16.4 16L20 22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
);

MdRegisteredLineIcon.displayName = "MdRegisteredLineIcon";

export { MdRegisteredLineIcon };
