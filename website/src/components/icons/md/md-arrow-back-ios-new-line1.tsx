import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowBackIosNewLine1Icon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M26.1075 20.3019L24.5743 21.8107L16.0001 13.2365L15.9825 13.2541L7.42486 21.8107L5.89165 20.3019L16.0001 10.1887L26.1075 20.3019Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowBackIosNewLine1Icon.displayName = "MdArrowBackIosNewLine1Icon";

export { MdArrowBackIosNewLine1Icon };
