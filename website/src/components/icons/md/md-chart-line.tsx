import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdChartLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M6.5 25.5H9.28027V14.9805H14.0703V6.37012H20.8506V11.1504H25.6299V25.5H27.5V27.5H4.5V4.5H6.5V25.5ZM11.2803 25.5H14.0605V16.9805H11.2803V25.5ZM20.8506 25.5H23.6299V13.1504H20.8506V25.5ZM16.0703 25.5H18.8496L18.8506 8.37012H16.0703V25.5Z" fill="currentColor"/>
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

MdChartLineIcon.displayName = "MdChartLineIcon";

export { MdChartLineIcon };
