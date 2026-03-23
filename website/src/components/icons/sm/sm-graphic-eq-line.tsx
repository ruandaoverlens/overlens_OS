import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmGraphicEqLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M6.49742 18.6631V5.35206H8.46235V18.6631H6.49742ZM11.025 23V1H12.9598V23H11.025ZM2 14.2961V9.71899H3.94971V14.2961H2ZM15.5224 18.6631V5.35206H17.4721V18.6631H15.5224ZM20.0351 14.2961V9.71899H22V14.2961H20.0351Z" fill="currentColor"/>
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

SmGraphicEqLineIcon.displayName = "SmGraphicEqLineIcon";

export { SmGraphicEqLineIcon };
