import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdArrowInsertLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M23.4079 7.45872V9.40794H10.7732L10.8152 9.45091L24.531 23.1667L23.1667 24.531L9.45091 10.8152L9.40794 10.7732V23.4079H7.45872V7.45872H23.4079Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdArrowInsertLineIcon.displayName = "MdArrowInsertLineIcon";

export { MdArrowInsertLineIcon };
