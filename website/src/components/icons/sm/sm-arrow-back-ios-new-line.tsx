import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmArrowBackIosNewLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M14.812 20L7 12L14.812 4L16 5.23705L9.3999 12L16 18.763L14.812 20Z" fill="currentColor"/>
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

SmArrowBackIosNewLineIcon.displayName = "SmArrowBackIosNewLineIcon";

export { SmArrowBackIosNewLineIcon };
