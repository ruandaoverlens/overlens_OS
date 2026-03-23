import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdMediumSoundSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17.1104 3.51853C17.3736 3.18325 17.8207 3.05121 18.2236 3.1904C18.6266 3.32967 18.8974 3.70939 18.8975 4.13572V27.8642C18.8975 28.2906 18.6266 28.6702 18.2236 28.8095C17.8207 28.9488 17.3736 28.8168 17.1104 28.4814L11.0781 20.7988H6.5C5.94772 20.7988 5.5 20.3511 5.5 19.7988V12.2011C5.50007 11.6489 5.94776 11.2011 6.5 11.2011H11.0791L17.1104 3.51853Z" fill="currentColor"/>
<path d="M24.3535 10.8105C25.7279 12.1854 26.5 14.0501 26.5 15.9941C26.5 17.9381 25.7279 19.8029 24.3535 21.1777L23.6465 21.8847L22.2324 20.4707L22.9395 19.7636C23.9389 18.7639 24.5 17.4078 24.5 15.9941C24.5 14.5805 23.9388 13.2244 22.9395 12.2246L22.2324 11.5176L23.6465 10.1035L24.3535 10.8105Z" fill="currentColor"/>
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

MdMediumSoundSolidIcon.displayName = "MdMediumSoundSolidIcon";

export { MdMediumSoundSolidIcon };
