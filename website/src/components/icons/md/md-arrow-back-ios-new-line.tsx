import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowBackIosNewLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M20.8107 7.42486L12.2541 15.9825L12.2365 16.0001L20.8107 24.5743L19.3019 26.1075L9.18866 16.0001L19.3019 5.89165L20.8107 7.42486Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowBackIosNewLineIcon.displayName = "MdArrowBackIosNewLineIcon";

export { MdArrowBackIosNewLineIcon };
