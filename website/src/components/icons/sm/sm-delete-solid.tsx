import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmDeleteSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M6.525 21.0003C6.125 21.0003 5.775 20.8503 5.475 20.5503C5.175 20.2503 5.025 19.9003 5.025 19.5003V5.25027H4V3.75027H8.7V3.00027H15.3V3.75027H20V5.25027H18.975V19.5003C18.975 19.9003 18.825 20.2503 18.525 20.5503C18.225 20.8503 17.875 21.0003 17.475 21.0003H6.525ZM9.175 17.3503H10.675V7.37527H9.175V17.3503ZM13.325 17.3503H14.825V7.37527H13.325V17.3503Z" fill="currentColor"/>
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

SmDeleteSolidIcon.displayName = "SmDeleteSolidIcon";

export { SmDeleteSolidIcon };
