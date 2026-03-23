import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmBookmarkSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M19.5 17.2506H18.0003V19.5006H19.5V21.0003H7.1247C5.6752 21.0001 4.5002 19.8251 4.5 18.3756V6.00064C4.5 4.34379 5.84354 3.00027 7.50044 3.00027H19.5V17.2506ZM7.1247 17.2506C6.50353 17.2508 5.99967 17.7545 5.99967 18.3756C5.99987 18.9967 6.50365 19.5004 7.1247 19.5006H16.5007V17.2506H7.1247ZM10.1251 4.49991V11.2895L10.6657 11.0247L12.7498 10.0008L15.3756 11.2895V4.49991H10.1251Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24.0003" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmBookmarkSolidIcon.displayName = "SmBookmarkSolidIcon";

export { SmBookmarkSolidIcon };
