import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdAdd2LineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17.1216 5.10495V14.8784H26.895V17.1382H17.1216V26.895H14.8618V17.1382H5.10495V14.8784H14.8618V5.10495H17.1216Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdAdd2LineIcon.displayName = "MdAdd2LineIcon";

export { MdAdd2LineIcon };
