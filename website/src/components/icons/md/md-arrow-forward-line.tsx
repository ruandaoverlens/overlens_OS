import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowForwardLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M26.6312 15.9993L15.9993 26.6312L14.6351 25.2659L22.8841 17.0179L22.9271 16.9749H5.35872V15.0247H22.9271L22.8841 14.9827L14.6351 6.73274L15.9993 5.36848L26.6312 15.9993Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowForwardLineIcon.displayName = "MdArrowForwardLineIcon";

export { MdArrowForwardLineIcon };
