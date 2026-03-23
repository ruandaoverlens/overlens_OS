import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdInfoSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M16 4C19.1826 4 22.2349 5.26421 24.4854 7.51465C26.7358 9.76509 28 12.8174 28 16C28 19.1826 26.7358 22.2349 24.4854 24.4854C22.2349 26.7358 19.1826 28 16 28C12.8174 28 9.76509 26.7358 7.51465 24.4854C5.26421 22.2349 4 19.1826 4 16C4 12.8174 5.26421 9.76509 7.51465 7.51465C9.76509 5.26421 12.8174 4 16 4ZM13 15.999H15V21.9971H17V13.999H13V15.999ZM15.0049 10.0029V12.0029H16.9951V10.0029H15.0049Z" fill="currentColor"/>
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

MdInfoSolidIcon.displayName = "MdInfoSolidIcon";

export { MdInfoSolidIcon };
