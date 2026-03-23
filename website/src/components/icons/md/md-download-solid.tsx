import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdDownloadSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M26.6255 6.00062H17.0036V17.7804L20.5491 14.4622L21.9673 15.7895L16 21.3752L10.0436 15.7895L11.4618 14.4622L15.0073 17.7804V6.00062H5.37455C4.64364 5.9785 4.03273 6.55366 4 7.29474V24.7045C4.03273 25.4456 4.64364 26.0208 5.37455 25.9987H26.6255C27.3564 26.0318 27.9673 25.4456 28 24.7045V7.29474C27.9673 6.55366 27.3564 5.9785 26.6255 6.00062Z" fill="currentColor"/>
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

MdDownloadSolidIcon.displayName = "MdDownloadSolidIcon";

export { MdDownloadSolidIcon };
