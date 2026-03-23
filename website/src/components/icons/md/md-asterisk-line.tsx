import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdAsteriskLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17.1062 3.82206V13.3133L17.1492 13.2713L23.8348 6.59159L25.3992 8.15604L18.6619 14.8933H28.1785V17.1219H18.7117L18.7547 17.1648L25.4002 23.8172L23.8426 25.3748L17.1492 18.6873L17.1062 18.6453V28.1785H14.8855V18.6707L14.8426 18.7127L8.17362 25.3748L6.61698 23.8182L13.2713 17.1648L13.3133 17.1219H3.82206V14.8933H13.3631L6.62479 8.15507L8.17362 6.59257L14.8426 13.2537L14.8855 13.2967V3.82206H17.1062Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdAsteriskLineIcon.displayName = "MdAsteriskLineIcon";

export { MdAsteriskLineIcon };
