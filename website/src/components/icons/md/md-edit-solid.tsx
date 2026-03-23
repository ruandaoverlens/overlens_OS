import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdEditSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M7.23992 26.9447C6.5746 27.0967 6.00907 26.9352 5.54335 26.4602C5.07762 25.9852 4.91129 25.4152 5.04435 24.7503L6.21342 19.0788L12.9142 25.7762L7.23992 26.9447ZM14.5395 24.1518L7.83871 17.4543L19.2442 6.05449C19.9476 5.3515 20.7935 5 21.782 5C22.7705 5 23.6164 5.3515 24.3197 6.05449L25.945 7.67897C26.6483 8.38196 27 9.22745 27 10.2154C27 11.2034 26.6483 12.0489 25.945 12.7519L14.5395 24.1518Z" fill="currentColor"/>
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

MdEditSolidIcon.displayName = "MdEditSolidIcon";

export { MdEditSolidIcon };
