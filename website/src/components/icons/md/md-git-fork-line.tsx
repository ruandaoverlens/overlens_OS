import { forwardRef } from "react";
import type { SVGProps } from "react";

const MdGitForkLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      width={32}
      height={32}
      viewBox="-2 -2 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle data-slot="front" cx="12" cy="18" r="3" />
      <circle data-slot="front" cx="6" cy="6" r="3" />
      <circle data-slot="front" cx="18" cy="6" r="3" />
      <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
      <path d="M12 12v3" />
    </svg>
  )
);

MdGitForkLineIcon.displayName = "MdGitForkLineIcon";

export { MdGitForkLineIcon };
