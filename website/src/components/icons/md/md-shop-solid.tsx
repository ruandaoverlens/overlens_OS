import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdShopSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M5.64063 5.69283C5.72146 4.73599 6.53213 4 7.50528 4H24.4947C25.4679 4 26.2786 4.73599 26.3594 5.69283L27.9901 25.0007C28.1265 26.6154 26.8351 28 25.1932 28H6.80685C5.16484 28 3.87353 26.6154 4.00989 25.0007L5.64063 5.69283ZM12.4917 8.61538C12.4917 10.492 14.0981 12.0769 16 12.0769C17.902 12.0769 19.5084 10.492 19.5084 8.61538C19.5084 7.97813 20.0319 7.46154 20.6778 7.46154C21.3237 7.46154 21.8473 7.97813 21.8473 8.61538C21.8473 11.7665 19.1937 14.3846 16 14.3846C12.8063 14.3846 10.1528 11.7665 10.1528 8.61538C10.1528 7.97813 10.6764 7.46154 11.3223 7.46154C11.9681 7.46154 12.4917 7.97813 12.4917 8.61538Z" fill="currentColor"/>
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

MdShopSolidIcon.displayName = "MdShopSolidIcon";

export { MdShopSolidIcon };
