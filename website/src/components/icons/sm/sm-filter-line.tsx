import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmFilterLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
  const clipId = useId();
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
<g clipPath="url(#${clipId})">
<path d="M17.166 19H6.83301V17H17.166V19Z" fill="currentColor"/>
<path d="M19.666 13H4.33301V11H19.666V13Z" fill="currentColor"/>
<path d="M23 7H1V5H23V7Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmFilterLineIcon.displayName = "SmFilterLineIcon";

export { SmFilterLineIcon };
