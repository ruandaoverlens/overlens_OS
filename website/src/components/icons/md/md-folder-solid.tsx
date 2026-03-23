import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdFolderSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M25.6 26C26.2365 26 26.847 25.7521 27.2971 25.3108C27.7471 24.8696 28 24.2711 28 23.6471V11.8824C28 11.2583 27.7471 10.6598 27.2971 10.2186C26.847 9.77731 26.2365 9.52941 25.6 9.52941H16.12C15.7186 9.53327 15.3227 9.43837 14.9684 9.25339C14.6141 9.06841 14.3128 8.79926 14.092 8.47059L13.12 7.05882C12.9015 6.73349 12.604 6.46645 12.2542 6.28164C11.9044 6.09684 11.5133 6.00006 11.116 6H6.4C5.76348 6 5.15303 6.2479 4.70294 6.68916C4.25286 7.13042 4 7.7289 4 8.35294V23.6471C4 24.2711 4.25286 24.8696 4.70294 25.3108C5.15303 25.7521 5.76348 26 6.4 26H25.6Z" fill="currentColor"/>
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

MdFolderSolidIcon.displayName = "MdFolderSolidIcon";

export { MdFolderSolidIcon };
