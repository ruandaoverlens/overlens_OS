import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmHomeSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M4.68906 22C3.75958 21.9899 3 21.2335 3 20.2955V9.23147C3 8.96924 3.05997 8.70701 3.1799 8.46495C3.29983 8.23298 3.46974 8.02118 3.67962 7.86989L10.9856 2.34291C11.1355 2.23197 11.2954 2.15129 11.4753 2.09077C11.6452 2.03026 11.8251 2 12.005 2C12.1849 2 12.3648 2.03026 12.5347 2.08069C12.7046 2.1412 12.8645 2.22189 13.0144 2.33283L20.3204 7.85981C20.5303 8.01109 20.7002 8.22289 20.8201 8.45487C20.94 8.69692 21 8.95915 21 9.22138V20.2854C21 21.2234 20.2404 21.9798 19.3109 21.9899H14.2438V14.0424H9.74625V21.9899H4.68906V22Z" fill="currentColor"/>
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

SmHomeSolidIcon.displayName = "SmHomeSolidIcon";

export { SmHomeSolidIcon };
