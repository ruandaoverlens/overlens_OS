import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdMailSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M6.33127 26.0771C5.57196 26.0771 4.92514 25.8099 4.39081 25.2756C3.85667 24.7414 3.5896 24.0947 3.5896 23.3354V8.69375C3.5896 7.92647 3.85667 7.27284 4.39081 6.73287C4.92514 6.1929 5.57196 5.92291 6.33127 5.92291H25.6396C26.4069 5.92291 27.0605 6.1929 27.6005 6.73287C28.1404 7.27284 28.4104 7.92647 28.4104 8.69375V23.3354C28.4104 24.0947 28.1404 24.7414 27.6005 25.2756C27.0605 25.8099 26.4069 26.0771 25.6396 26.0771H6.33127ZM15.9854 17.4729L25.6396 10.9687V8.69375L15.9854 15.0521L6.33127 8.69375V10.9687L15.9854 17.4729Z" fill="currentColor"/>
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

MdMailSolidIcon.displayName = "MdMailSolidIcon";

export { MdMailSolidIcon };
