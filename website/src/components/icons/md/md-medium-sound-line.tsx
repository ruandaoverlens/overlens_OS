import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdMediumSoundLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M17.1104 3.51875C17.3736 3.18347 17.8207 3.05143 18.2236 3.19062C18.6266 3.3299 18.8974 3.70961 18.8975 4.13594V27.8645C18.8975 28.2908 18.6266 28.6705 18.2236 28.8098C17.8207 28.949 17.3736 28.817 17.1104 28.4816L11.0781 20.799H6.5C5.94772 20.799 5.5 20.3513 5.5 19.799V12.2014C5.50007 11.6491 5.94776 11.2014 6.5 11.2014H11.0791L17.1104 3.51875ZM12.3516 12.8186C12.162 13.06 11.8724 13.2013 11.5654 13.2014H7.5V18.799H11.5654L11.6797 18.8059C11.9433 18.8362 12.1857 18.9707 12.3516 19.1818L16.8975 24.9719V7.02754L12.3516 12.8186Z" fill="currentColor"/>
<path d="M24.3535 10.8107C25.7279 12.1856 26.5 14.0503 26.5 15.9943C26.5 17.9383 25.7279 19.8031 24.3535 21.1779L23.6465 21.885L22.2324 20.4709L22.9395 19.7639C23.9389 18.7641 24.5 17.408 24.5 15.9943C24.5 14.5807 23.9388 13.2246 22.9395 12.2248L22.2324 11.5178L23.6465 10.1037L24.3535 10.8107Z" fill="currentColor"/>
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

MdMediumSoundLineIcon.displayName = "MdMediumSoundLineIcon";

export { MdMediumSoundLineIcon };
