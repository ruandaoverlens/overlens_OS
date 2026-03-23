import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdBoltSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M10.4444 27L14.8889 18.75L6 17.65L19.3333 5H21.5556L17.1111 13.25L26 14.35L12.6667 27H10.4444Z" fill="currentColor"/>
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

MdBoltSolidIcon.displayName = "MdBoltSolidIcon";

export { MdBoltSolidIcon };
