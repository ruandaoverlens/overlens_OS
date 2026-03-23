import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmLogoutLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M4.10999 20.5C3.52563 20.5 3.02783 20.2981 2.61661 19.8943C2.20554 19.4904 2 19.0014 2 18.4274V5.59468C2 5.01464 2.20554 4.52051 2.61661 4.11231C3.02783 3.7041 3.52563 3.5 4.10999 3.5H10.7542V5.59468H4.10999V18.4274H10.7542V20.5H4.10999ZM17.2862 16.6634L15.7823 15.2082L17.9596 13.0473H10.5073V10.9747H17.9147L15.7374 8.81388L17.2413 7.35863L22 12.0331L17.2862 16.6634Z" fill="currentColor"/>
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

SmLogoutLineIcon.displayName = "SmLogoutLineIcon";

export { SmLogoutLineIcon };
