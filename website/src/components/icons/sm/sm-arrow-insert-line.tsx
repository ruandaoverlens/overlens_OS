import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowInsertLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17.856 19L6.63424 7.77821V18.0739H5V5H18.0739V6.63424H7.77821L19 17.856L17.856 19Z" fill="currentColor"/>
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

SmArrowInsertLineIcon.displayName = "SmArrowInsertLineIcon";

export { SmArrowInsertLineIcon };
