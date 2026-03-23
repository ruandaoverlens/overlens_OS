import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdInfoLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17 20.9971H15V14.999H13.999V12.999H17V20.9971Z" fill="currentColor"/>
<path d="M16.9951 12.0029H15.0049V10.0029H16.9951V12.0029Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M16 4C19.1826 4 22.2349 5.26421 24.4854 7.51465C26.7358 9.76509 28 12.8174 28 16C28 19.1826 26.7358 22.2349 24.4854 24.4854C22.2349 26.7358 19.1826 28 16 28C12.8174 28 9.76509 26.7358 7.51465 24.4854C5.26421 22.2349 4 19.1826 4 16C4 12.8174 5.26421 9.76509 7.51465 7.51465C9.76509 5.26421 12.8174 4 16 4ZM16 6C13.3478 6 10.8041 7.05335 8.92871 8.92871C7.05335 10.8041 6 13.3478 6 16C6 18.6522 7.05335 21.1959 8.92871 23.0713C10.8041 24.9467 13.3478 26 16 26C18.6522 26 21.1959 24.9467 23.0713 23.0713C24.9467 21.1959 26 18.6522 26 16C26 13.3478 24.9467 10.8041 23.0713 8.92871C21.1959 7.05335 18.6522 6 16 6Z" fill="currentColor"/>
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

MdInfoLineIcon.displayName = "MdInfoLineIcon";

export { MdInfoLineIcon };
