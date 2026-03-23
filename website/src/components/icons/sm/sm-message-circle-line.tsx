import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmMessageCircleLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
  const clipId = useId();
    return (
      <svg
        ref={ref}
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
<g clipPath="url(#clip0)">
<path fillRule="evenodd" clipRule="evenodd" d="M12 4.7998C7.91604 4.7998 4.7998 7.91604 4.7998 12C4.7998 13.3584 5.14697 14.6353 5.76416 15.7471L5.87109 15.9404L5.18164 18.8184L8.05957 18.1289L8.25293 18.2358C9.36475 18.853 10.6416 19.2002 12 19.2002C16.084 19.2002 19.2002 16.084 19.2002 12C19.2002 7.91604 16.084 4.7998 12 4.7998ZM3.2002 12C3.2002 7.03238 7.03238 3.2002 12 3.2002C16.9676 3.2002 20.7998 7.03238 20.7998 12C20.7998 16.9676 16.9676 20.7998 12 20.7998C10.4348 20.7998 8.96289 20.3989 7.68066 19.6934L3.5 20.5L4.30664 16.3193C3.60107 15.0371 3.2002 13.5652 3.2002 12Z" fill="currentColor"/>
</g>
<defs>
<clipPath id="clip0">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmMessageCircleLineIcon.displayName = "SmMessageCircleLineIcon";

export { SmMessageCircleLineIcon };
