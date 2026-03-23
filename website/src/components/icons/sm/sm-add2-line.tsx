import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmAdd2LineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M10.9877 21.5V13.0123H2.5V11.0022H10.9877V2.5H12.9978V11.0022H21.5V13.0123H12.9978V21.5H10.9877Z" fill="currentColor"/>
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

SmAdd2LineIcon.displayName = "SmAdd2LineIcon";

export { SmAdd2LineIcon };
