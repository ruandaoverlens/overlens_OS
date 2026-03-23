import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdShopLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M20.584 7.66699C21.1361 7.66717 21.584 8.11482 21.584 8.66699C21.5838 11.7155 19.0486 14.25 16 14.25C12.9516 14.2498 10.4172 11.7154 10.417 8.66699C10.417 8.11475 10.8647 7.66706 11.417 7.66699C11.9693 7.66699 12.417 8.11471 12.417 8.66699C12.4172 10.6108 14.0562 12.2497 16 12.25C17.944 12.25 19.5838 10.611 19.584 8.66699C19.584 8.11475 20.0317 7.66706 20.584 7.66699Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M24.3232 4C25.2579 4 26.0459 4.67172 26.209 5.57422L26.2334 5.75781L27.831 24.9316C27.9686 26.5834 26.6652 27.9999 25.0078 28H6.99217C5.33497 27.9996 4.03142 26.5832 4.16893 24.9316L5.76658 5.75781L5.791 5.57422C5.95401 4.67179 6.7423 4.00019 7.67674 4H24.3232ZM6.16209 25.0977C6.12171 25.5832 6.50494 25.9996 6.99217 26H25.0078C25.4952 25.9999 25.8783 25.5834 25.8379 25.0977L24.2461 6H7.75389L6.16209 25.0977Z" fill="currentColor"/>
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

MdShopLineIcon.displayName = "MdShopLineIcon";

export { MdShopLineIcon };
