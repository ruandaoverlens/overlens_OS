import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdDockToRightLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
  const clipId = useId();
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
<g clipPath="url(#${clipId})">
<path d="M7.39011 5.10495H24.5932C25.238 5.10495 25.7827 5.32759 26.228 5.77292C26.673 6.21815 26.895 6.76222 26.895 7.40671V24.6098C26.895 25.25 26.6733 25.7908 26.228 26.2329C25.7827 26.6749 25.238 26.895 24.5932 26.895H7.39011C6.74986 26.895 6.20907 26.6749 5.76706 26.2329C5.32505 25.7909 5.10495 25.2501 5.10495 24.6098V7.40671C5.10496 6.76194 5.326 6.21725 5.76804 5.77194C6.20998 5.32695 6.75014 5.10496 7.39011 5.10495ZM7.36472 24.6352H11.4555V7.38132H7.36472V24.6352ZM13.7319 24.6352H24.6186V7.38132H13.7319V24.6352Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="32" height="32" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

MdDockToRightLineIcon.displayName = "MdDockToRightLineIcon";

export { MdDockToRightLineIcon };
