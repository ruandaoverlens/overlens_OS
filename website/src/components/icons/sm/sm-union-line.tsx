import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmUnionLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M20.8421 4C21.2842 4 21.6708 4.16021 22.0024 4.48021C22.334 4.80021 22.5 5.17333 22.5 5.6V18.4C22.5 18.8088 22.3339 19.1774 22.0024 19.5063C21.6708 19.8351 21.2842 20 20.8421 20H3.15789C2.71579 20 2.32916 19.8351 1.99758 19.5063C1.66608 19.1774 1.5 18.8088 1.5 18.4V5.6C1.5 5.17333 1.66601 4.80021 1.99758 4.48021C2.32916 4.16021 2.71579 4 3.15789 4H20.8421ZM12 14.6667L3.15789 7.57292V18.4H20.8421V7.57292L12 14.6667ZM12 12.5604L20.7039 5.6H3.29605L12 12.5604Z" fill="currentColor"/>
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

SmUnionLineIcon.displayName = "SmUnionLineIcon";

export { SmUnionLineIcon };
