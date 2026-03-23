import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmAsteriskLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<g clipPath="url(#${clipId})">
<path d="M11.0661 22V14.2376L5.58672 19.7107L4.28271 18.4067L9.74925 12.9402H2V11.0727H9.78968L4.28927 5.57252L5.58672 4.26195L11.0661 9.73505V2H12.9273V9.74925L18.4212 4.26195L19.7315 5.57252L14.2311 11.0727H22V12.9402H14.2715L19.7315 18.4067L18.4275 19.7107L12.9273 14.2169V22H11.0661Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmAsteriskLineIcon.displayName = "SmAsteriskLineIcon";

export { SmAsteriskLineIcon };
