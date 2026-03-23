import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmUploadLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M11.0564 16.553V6.63063L7.78427 9.90938L6.43248 8.56421L11.9967 3L17.5609 8.56421L16.2091 9.90938L12.937 6.63063V16.553H11.0564ZM4.88031 21C4.37249 21 3.9322 20.8135 3.55943 20.4406C3.18648 20.0678 3 19.6275 3 19.1197V15.173H4.88031V19.1197H19.1131V15.173H21V19.1197C21 19.6271 20.8129 20.0674 20.4386 20.4406C20.0646 20.8135 19.6227 21 19.1131 21H4.88031Z" fill="currentColor"/>
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

SmUploadLineIcon.displayName = "SmUploadLineIcon";

export { SmUploadLineIcon };
