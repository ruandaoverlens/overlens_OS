import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdBookmarkSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M6 8C6 5.79086 7.79086 4 10 4H26V23H24V26H26V28H9.5C7.567 28 6 26.433 6 24.5V8ZM9.5 23H22V26H9.5C8.67157 26 8 25.3284 8 24.5C8 23.6716 8.67157 23 9.5 23ZM13.5 6H20.5V15.0525L19.7796 14.6988L17 13.334L14.2204 14.6988L13.5 15.0525V6Z" fill="currentColor"/>
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

MdBookmarkSolidIcon.displayName = "MdBookmarkSolidIcon";

export { MdBookmarkSolidIcon };
