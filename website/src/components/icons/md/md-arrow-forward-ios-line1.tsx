import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowForwardIosLine1Icon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M26.1075 11.6995L16.0001 21.8079L5.89165 11.6995L7.42388 10.1907L16.0001 18.7669L16.0176 18.7493L24.5752 10.1907L26.1075 11.6995Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowForwardIosLine1Icon.displayName = "MdArrowForwardIosLine1Icon";

export { MdArrowForwardIosLine1Icon };
