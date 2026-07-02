import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmMessageCircleSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<g clipPath={`url(#${clipId})`}>
<path d="M12 3.2002C7.03238 3.2002 3.2002 7.03238 3.2002 12C3.2002 13.5652 3.60107 15.0371 4.30664 16.3193L3.5 20.5L7.68066 19.6934C8.96289 20.3989 10.4348 20.7998 12 20.7998C16.9676 20.7998 20.7998 16.9676 20.7998 12C20.7998 7.03238 16.9676 3.2002 12 3.2002Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={clipId}>
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmMessageCircleSolidIcon.displayName = "SmMessageCircleSolidIcon";

export { SmMessageCircleSolidIcon };
