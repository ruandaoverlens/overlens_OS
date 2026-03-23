import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdCheckLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M29.5264 7.99934L11.7705 25.7562L2.47266 16.4583L4.22852 14.7015L11.7705 22.2435L27.7705 6.24348L29.5264 7.99934Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdCheckLineIcon.displayName = "MdCheckLineIcon";

export { MdCheckLineIcon };
