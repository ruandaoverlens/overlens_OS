import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdDeleteLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M20.3753 4.02539V5.02539H26.6419V6.97461H25.2747V26C25.2747 26.5262 25.0776 26.9862 24.682 27.3818C24.2864 27.7774 23.8264 27.9746 23.3001 27.9746H8.69955C8.15644 27.9745 7.69182 27.7815 7.30502 27.3945C6.91805 27.0077 6.72495 26.5432 6.72495 26V6.97461H5.35873V5.02539H11.6253V4.02539H20.3753ZM8.67514 26.0254H23.3246V6.97461H8.67514V26.0254ZM19.7415 9.8584V23.1084H17.7914V9.8584H19.7415ZM14.2083 9.8584V23.1084H12.2581V9.8584H14.2083Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdDeleteLineIcon.displayName = "MdDeleteLineIcon";

export { MdDeleteLineIcon };
