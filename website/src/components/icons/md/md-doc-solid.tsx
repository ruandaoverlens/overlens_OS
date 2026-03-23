import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdDocSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M19.375 4.5C19.5057 4.5 19.6312 4.55123 19.7246 4.64258L25.3496 10.1426C25.4458 10.2366 25.5 10.3655 25.5 10.5V24.7998C25.5 25.5195 25.2073 26.2075 24.6904 26.7129C24.1739 27.218 23.4758 27.5 22.75 27.5H9.25C8.52424 27.5 7.82611 27.218 7.30957 26.7129C6.79268 26.2075 6.5 25.5195 6.5 24.7998V7.2002C6.5 6.48047 6.79268 5.79254 7.30957 5.28711C7.82611 4.78204 8.52424 4.5 9.25 4.5H19.375ZM11.5 20.5C10.9478 20.5001 10.5 20.9478 10.5 21.5C10.5 22.0522 10.9478 22.4999 11.5 22.5H20.5C21.0523 22.5 21.5 22.0523 21.5 21.5C21.5 20.9477 21.0523 20.5 20.5 20.5H11.5ZM11.5 15.1006C10.9478 15.1007 10.5 15.5483 10.5 16.1006C10.5003 16.6526 10.9479 17.1005 11.5 17.1006H20.5C21.0521 17.1006 21.4997 16.6526 21.5 16.1006C21.5 15.5483 21.0523 15.1006 20.5 15.1006H11.5Z" fill="currentColor"/>
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

MdDocSolidIcon.displayName = "MdDocSolidIcon";

export { MdDocSolidIcon };
