import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmShopSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M4.23047 4.2699C4.29109 3.55227 4.8991 3.00027 5.62896 3.00027H18.371C19.1009 3.00027 19.709 3.55227 19.7696 4.2699L20.9926 18.7508C21.0949 19.9618 20.1263 21.0003 18.8949 21.0003H5.10514C3.87363 21.0003 2.90514 19.9618 3.00742 18.7508L4.23047 4.2699ZM9.36878 6.46181C9.36878 7.86926 10.5736 9.05797 12 9.05797C13.4265 9.05797 14.6313 7.86926 14.6313 6.46181C14.6313 5.98387 15.024 5.59643 15.5084 5.59643C15.9928 5.59643 16.3854 5.98387 16.3854 6.46181C16.3854 8.82514 14.3953 10.7887 12 10.7887C9.60475 10.7887 7.61462 8.82514 7.61462 6.46181C7.61462 5.98387 8.0073 5.59643 8.4917 5.59643C8.9761 5.59643 9.36878 5.98387 9.36878 6.46181Z" fill="currentColor"/>
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

SmShopSolidIcon.displayName = "SmShopSolidIcon";

export { SmShopSolidIcon };
