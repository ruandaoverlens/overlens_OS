import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmDeleteLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M5.84063 22C5.37656 22 4.97934 21.8368 4.64897 21.5103C4.31841 21.184 4.15312 20.7917 4.15312 20.3333V4.5H3V2.83333H8.2875V2H15.7125V2.83333H21V4.5H19.8469V20.3333C19.8469 20.7778 19.6781 21.1667 19.3406 21.5C19.0031 21.8333 18.6094 22 18.1594 22H5.84063ZM18.1594 4.5H5.84063V20.3333H18.1594V4.5ZM8.82188 17.9444H10.5094V6.86111H8.82188V17.9444ZM13.4906 17.9444H15.1781V6.86111H13.4906V17.9444Z" fill="currentColor"/>
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

SmDeleteLineIcon.displayName = "SmDeleteLineIcon";

export { SmDeleteLineIcon };
