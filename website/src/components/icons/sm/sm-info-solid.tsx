import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmInfoSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M12 3C14.3869 3 16.6766 3.94779 18.3644 5.63562C20.0522 7.32345 21 9.61305 21 12C21 14.3869 20.0522 16.6766 18.3644 18.3644C16.6766 20.0522 14.3869 21 12 21C9.61305 21 7.32345 20.0522 5.63562 18.3644C3.94779 16.6766 3 14.3869 3 12C3 9.61305 3.94779 7.32345 5.63562 5.63562C7.32345 3.94779 9.61305 3 12 3ZM9.54565 12.0813H11.1002V16.9076H12.8998V10.2817H9.54565V12.0813ZM11.1859 7.01221V8.81177H12.8141V7.01221H11.1859Z" fill="currentColor"/>
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

SmInfoSolidIcon.displayName = "SmInfoSolidIcon";

export { SmInfoSolidIcon };
