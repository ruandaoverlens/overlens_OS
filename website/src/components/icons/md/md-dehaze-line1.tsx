import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdDehazeLine1Icon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M15.9746 23.3581V25.3083H4.02539V23.3581H15.9746ZM27.9746 15.0251V16.9753H4.02539V15.0251H27.9746ZM27.9746 6.69206V8.64128H4.02539V6.69206H27.9746Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdDehazeLine1Icon.displayName = "MdDehazeLine1Icon";

export { MdDehazeLine1Icon };
