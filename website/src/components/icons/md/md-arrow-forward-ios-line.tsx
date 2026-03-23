import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowForwardIosLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M22.8079 16.0001L12.6995 26.1075L11.1907 24.5752L19.7493 16.0176L19.7669 16.0001L11.1907 7.42388L12.6995 5.89165L22.8079 16.0001Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowForwardIosLineIcon.displayName = "MdArrowForwardIosLineIcon";

export { MdArrowForwardIosLineIcon };
