import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmDehazeLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M2 5.71435V4.00006H22V5.71435H2ZM2 20.0001V18.2858H22V20.0001H2ZM2 12.8572V11.1429H22V12.8572H2Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24.0001" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmDehazeLineIcon.displayName = "SmDehazeLineIcon";

export { SmDehazeLineIcon };
