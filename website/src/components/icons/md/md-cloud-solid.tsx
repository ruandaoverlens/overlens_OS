import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdCloudSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M8.36665 26.6667C6.41109 26.6667 4.74998 25.9833 3.38331 24.6167C2.01665 23.25 1.33331 21.5889 1.33331 19.6333C1.33331 17.9667 1.91665 16.55 3.08331 15.3833C4.24998 14.2167 5.66665 13.6333 7.33331 13.6333C8.99998 13.6333 10.4166 14.1667 11.5833 15.2333C12.75 16.3 13.3333 17.6667 13.3333 19.3333H15.3333C15.3333 17.4889 14.65 15.7889 13.2833 14.2333C11.9166 12.6778 9.98887 11.8111 7.49998 11.6333C8.05554 9.81111 9.13331 8.30555 10.7333 7.11666C12.3333 5.92777 14.1 5.33333 16.0333 5.33333C18.5222 5.33333 20.6278 6.24999 22.35 8.08333C24.0722 9.91666 24.9333 12.0889 24.9333 14.6V15.4C26.5778 15.4 27.9444 15.9333 29.0333 17C30.1222 18.0667 30.6666 19.4111 30.6666 21.0333C30.6666 22.5667 30.1111 23.8889 29 25C27.8889 26.1111 26.5666 26.6667 25.0333 26.6667H8.36665Z" fill="currentColor"/>
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

MdCloudSolidIcon.displayName = "MdCloudSolidIcon";

export { MdCloudSolidIcon };
