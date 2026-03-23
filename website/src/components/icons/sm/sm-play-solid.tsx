import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmPlaySolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M9.81778 15.8235L15.8253 12.0044L9.81778 8.17701V15.8235ZM12.0031 21.0003C10.7999 21.0003 9.61316 20.7631 8.51643 20.2888C6.35569 19.3728 4.62874 17.6473 3.71206 15.4882C2.76265 13.2474 2.76265 10.7204 3.71206 8.48778C4.1704 7.41645 4.82517 6.45143 5.64363 5.63362C6.47027 4.81581 7.44424 4.16156 8.51643 3.71177C10.7508 2.76311 13.2717 2.76311 15.5143 3.71177C17.6668 4.61954 19.3856 6.33694 20.2941 8.48778C21.2353 10.7204 21.2353 13.2474 20.2941 15.4801C19.8357 16.5514 19.1892 17.5246 18.3707 18.3506C17.5522 19.1766 16.5783 19.8308 15.5143 20.2806C14.4093 20.7549 13.2144 21.0003 12.0031 20.9921V21.0003Z" fill="currentColor"/>
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

SmPlaySolidIcon.displayName = "SmPlaySolidIcon";

export { SmPlaySolidIcon };
