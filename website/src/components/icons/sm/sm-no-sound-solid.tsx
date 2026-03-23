import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmNoSoundSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M10.5382 2.43349C10.8282 2.05417 11.3214 1.90482 11.7662 2.06181C12.211 2.21894 12.5095 2.64766 12.5095 3.12943V20.8708C12.5095 21.3525 12.211 21.7813 11.7662 21.9384C11.3213 22.0954 10.8282 21.9461 10.5382 21.5667L6.25509 15.9629H3.10309C2.49389 15.9629 2.00004 15.4572 2 14.8335V9.16674C2 8.54301 2.49387 8.03737 3.10309 8.03737H6.25509L10.5382 2.43349Z" fill="currentColor"/>
<path d="M22 9.16674L19.2315 12.0001L21.3763 14.1949L22 14.8346L20.7526 16.1118L20.1278 15.4732L17.9841 13.2773L15.2166 16.1118L13.9681 14.8346L16.7355 12.0001L14.5929 9.80533L13.9681 9.16674L15.2166 7.88847L15.8404 8.52816L17.9841 10.7218L20.7526 7.88847L22 9.16674Z" fill="currentColor"/>
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

SmNoSoundSolidIcon.displayName = "SmNoSoundSolidIcon";

export { SmNoSoundSolidIcon };
