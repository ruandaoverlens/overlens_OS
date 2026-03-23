import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdClockLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M16.2095 18.188L20.3169 22.2954L18.9028 23.7095L14.2095 19.0161V11.8022H16.2095V18.188Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M16.0093 6.40283C19.0325 6.40294 21.932 7.60399 24.0698 9.7417C26.2077 11.8796 27.4087 14.7798 27.4087 17.8032C27.4085 20.8265 26.2076 23.726 24.0698 25.8638C21.932 28.0014 19.0325 29.2025 16.0093 29.2026C12.9859 29.2025 10.0856 28.0016 7.94775 25.8638C5.81009 23.726 4.60904 20.8264 4.60889 17.8032C4.60889 14.7799 5.81002 11.8796 7.94775 9.7417C10.0856 7.60387 12.9859 6.40293 16.0093 6.40283ZM16.0093 8.40283C13.5164 8.40293 11.1246 9.39301 9.36182 11.1558C7.59915 12.9186 6.60889 15.3103 6.60889 17.8032C6.60904 20.296 7.59923 22.687 9.36182 24.4497C11.1246 26.2125 13.5164 27.2025 16.0093 27.2026C18.502 27.2025 20.893 26.2123 22.6558 24.4497C24.4185 22.687 25.4085 20.296 25.4087 17.8032C25.4087 15.3102 24.4186 12.9186 22.6558 11.1558C20.893 9.39313 18.5021 8.40294 16.0093 8.40283Z" fill="currentColor"/>
<path d="M9.41455 4.35889L3.85303 8.80811L2.604 7.24658L8.16553 2.79736L9.41455 4.35889Z" fill="currentColor"/>
<path d="M29.396 7.12549L28.2866 8.78955L21.8228 4.47998L22.9321 2.81592L29.396 7.12549Z" fill="currentColor"/>
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

MdClockLineIcon.displayName = "MdClockLineIcon";

export { MdClockLineIcon };
