import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdHomeSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M7.06441 28C5.92837 27.9879 5 27.0802 5 25.9546V12.6778C5 12.3631 5.07329 12.0484 5.21988 11.7579C5.36646 11.4796 5.57413 11.2254 5.83065 11.0439L14.7601 4.4115C14.9434 4.27837 15.1388 4.18154 15.3587 4.10893C15.5664 4.03631 15.7862 4 16.0061 4C16.226 4 16.4459 4.03631 16.6535 4.09682C16.8612 4.16944 17.0566 4.26626 17.2399 4.39939L26.1693 11.0318C26.4259 11.2133 26.6335 11.4675 26.7801 11.7458C26.9267 12.0363 27 12.351 27 12.6657V25.9425C27 27.0681 26.0716 27.9758 24.9356 27.9879H18.7424V18.4508H13.2454V27.9879H7.06441V28Z" fill="currentColor"/>
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

MdHomeSolidIcon.displayName = "MdHomeSolidIcon";

export { MdHomeSolidIcon };
