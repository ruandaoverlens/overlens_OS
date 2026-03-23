import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdCloseLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M24.9639 8.54102L17.5234 15.9824L17.5059 16L24.9639 23.458L23.458 24.9639L16 17.5059L15.9824 17.5234L8.54102 24.9639L7.03516 23.458L14.4766 16.0176L14.4941 16L7.03516 8.54102L8.54102 7.03516L16 14.4941L16.0176 14.4766L23.458 7.03516L24.9639 8.54102Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdCloseLineIcon.displayName = "MdCloseLineIcon";

export { MdCloseLineIcon };
