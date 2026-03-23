import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdDeleteSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M8.69998 28C8.16665 28 7.69998 27.8 7.29998 27.4C6.89998 27 6.69998 26.5333 6.69998 26V7H5.33331V5H11.6V4H20.4V5H26.6666V7H25.3V26C25.3 26.5333 25.1 27 24.7 27.4C24.3 27.8 23.8333 28 23.3 28H8.69998ZM12.2333 23.1333H14.2333V9.83333H12.2333V23.1333ZM17.7666 23.1333H19.7666V9.83333H17.7666V23.1333Z" fill="currentColor"/>
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

MdDeleteSolidIcon.displayName = "MdDeleteSolidIcon";

export { MdDeleteSolidIcon };
