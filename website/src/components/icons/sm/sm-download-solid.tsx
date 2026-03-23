import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmDownloadSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M19.9691 5.00071H12.7527V13.2466L15.4118 10.9238L16.4755 11.8529L12 15.7629L7.53273 11.8529L8.59636 10.9238L11.2555 13.2466V5.00071H4.03091C3.48273 4.98522 3.02455 5.38784 3 5.90659V18.0935C3.02455 18.6122 3.48273 19.0148 4.03091 18.9993H19.9691C20.5173 19.0226 20.9755 18.6122 21 18.0935V5.90659C20.9755 5.38784 20.5173 4.98522 19.9691 5.00071Z" fill="currentColor"/>
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

SmDownloadSolidIcon.displayName = "SmDownloadSolidIcon";

export { SmDownloadSolidIcon };
