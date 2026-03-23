import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdBookmarkLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M26 23H24V26H26V28H9.5C7.567 28 6 26.433 6 24.5V8C6 5.79087 7.79087 4 10 4H26V23ZM9.5 23C8.67158 23 8 23.6716 8 24.5C8 25.3284 8.67158 26 9.5 26H22V23H9.5ZM10 6C8.89543 6 8 6.89543 8 8V21.3359C8.45454 21.1201 8.96334 21 9.5 21H24V6H21V15.1055L17 13.1406L13 15.1055V6H10ZM15 11.8945L17 10.9131L19 11.8945V6H15V11.8945Z" fill="currentColor"/>
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

MdBookmarkLineIcon.displayName = "MdBookmarkLineIcon";

export { MdBookmarkLineIcon };
