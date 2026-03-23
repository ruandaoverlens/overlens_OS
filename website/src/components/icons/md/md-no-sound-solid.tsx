import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdNoSoundSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M14.2969 3.60216C14.5598 3.26628 15.0069 3.13405 15.4102 3.27306C15.8134 3.41218 16.084 3.79178 16.084 4.21837V27.7818C16.084 28.2084 15.8133 28.588 15.4102 28.7272C15.0068 28.8662 14.5598 28.7341 14.2969 28.3981L8.32422 20.7643H3.79297C3.2408 20.7643 2.79316 20.3164 2.79297 19.7643V12.2369C2.79297 11.6846 3.24068 11.2369 3.79297 11.2369H8.32324L14.2969 3.60216Z" fill="currentColor"/>
<path d="M29.207 12.2369L25.4434 16.0006L29.207 19.7643L27.793 21.1783L24.0293 17.4147L20.2656 21.1783L18.8516 19.7643L22.6152 16.0006L18.8516 12.2369L20.2656 10.8229L24.0293 14.5865L27.793 10.8229L29.207 12.2369Z" fill="currentColor"/>
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

MdNoSoundSolidIcon.displayName = "MdNoSoundSolidIcon";

export { MdNoSoundSolidIcon };
