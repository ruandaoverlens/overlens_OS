import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmCloseLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M6.1989 19L5 17.8011L10.8011 12L5 6.19889L6.1989 5L12 10.8011L17.8011 5L19 6.19889L13.1989 12L19 17.8011L17.8011 19L12 13.1989L6.1989 19Z" fill="currentColor"/>
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

SmCloseLineIcon.displayName = "SmCloseLineIcon";

export { SmCloseLineIcon };
