import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdGraphicEqLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17.1728 2.21156V29.7887H14.8086V2.21156H17.1728ZM22.8047 7.6764V24.3424H20.4209V7.6764H22.8047ZM11.5595 7.6764V24.3424H9.1572V7.6764H11.5595ZM28.455 13.1608V18.858H26.0527V13.1608H28.455ZM5.9277 13.1608V18.858H3.54489V13.1608H5.9277Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdGraphicEqLineIcon.displayName = "MdGraphicEqLineIcon";

export { MdGraphicEqLineIcon };
