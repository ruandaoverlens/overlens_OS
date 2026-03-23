import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdPlaySolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M13.0904 21.0977L21.1004 16.0055L13.0904 10.9023V21.0977ZM16.0041 28C14.3999 28 12.8176 27.6838 11.3552 27.0513C8.47425 25.8301 6.17165 23.5293 4.94941 20.6506C3.68353 17.6629 3.68353 14.2935 4.94941 11.3167C5.56053 9.88823 6.43356 8.60154 7.52484 7.51113C8.62703 6.42072 9.92566 5.54839 11.3552 4.94866C14.3344 3.68378 17.6956 3.68378 20.6857 4.94866C23.5558 6.15902 25.8475 8.44889 27.0588 11.3167C28.3137 14.2935 28.3137 17.6629 27.0588 20.6397C26.4477 22.0682 25.5855 23.3657 24.4943 24.4671C23.403 25.5684 22.1044 26.4407 20.6857 27.0404C19.2125 27.6729 17.6192 28 16.0041 27.9891V28Z" fill="currentColor"/>
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

MdPlaySolidIcon.displayName = "MdPlaySolidIcon";

export { MdPlaySolidIcon };
