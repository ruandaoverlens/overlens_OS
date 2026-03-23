import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmVisibilitySolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M15.1875 15.1875C16.0625 14.3125 16.5 13.25 16.5 12C16.5 10.75 16.0625 9.6875 15.1875 8.8125C14.3125 7.9375 13.25 7.5 12 7.5C10.75 7.5 9.6875 7.9375 8.8125 8.8125C7.9375 9.6875 7.5 10.75 7.5 12C7.5 13.25 7.9375 14.3125 8.8125 15.1875C9.6875 16.0625 10.75 16.5 12 16.5C13.25 16.5 14.3125 16.0625 15.1875 15.1875ZM10.0875 13.9125C9.5625 13.3875 9.3 12.75 9.3 12C9.3 11.25 9.5625 10.6125 10.0875 10.0875C10.6125 9.5625 11.25 9.3 12 9.3C12.75 9.3 13.3875 9.5625 13.9125 10.0875C14.4375 10.6125 14.7 11.25 14.7 12C14.7 12.75 14.4375 13.3875 13.9125 13.9125C13.3875 14.4375 12.75 14.7 12 14.7C11.25 14.7 10.6125 14.4375 10.0875 13.9125ZM5.35 17.4625C3.35 16.1042 1.9 14.2833 1 12C1.9 9.71667 3.35 7.89583 5.35 6.5375C7.35 5.17917 9.56667 4.5 12 4.5C14.4333 4.5 16.65 5.17917 18.65 6.5375C20.65 7.89583 22.1 9.71667 23 12C22.1 14.2833 20.65 16.1042 18.65 17.4625C16.65 18.8208 14.4333 19.5 12 19.5C9.56667 19.5 7.35 18.8208 5.35 17.4625Z" fill="currentColor"/>
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

SmVisibilitySolidIcon.displayName = "SmVisibilitySolidIcon";

export { SmVisibilitySolidIcon };
