import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmSoundSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M10.6663 2.43531C10.9615 2.05462 11.4638 1.90444 11.9172 2.06166C12.3705 2.21898 12.6754 2.64865 12.6754 3.13177V20.8683C12.6752 21.3513 12.3705 21.7811 11.9172 21.9384C11.4638 22.0955 10.9615 21.9453 10.6663 21.5647L6.32106 15.9621H3.12361C2.50314 15.9621 2.00013 15.4552 2 14.8301V9.16997C2 8.54477 2.50306 8.03794 3.12361 8.03794H6.32106L10.6663 2.43531Z" fill="currentColor"/>
<path d="M18.9946 4.68941C20.9186 6.62845 22 9.25822 22 12C21.9999 14.7418 20.9186 17.3716 18.9946 19.3106L18.3592 19.9507L17.0875 18.6706L17.7239 18.0294C19.3107 16.4301 20.2026 14.2613 20.2027 12C20.2026 9.73854 19.3109 7.56895 17.7239 5.96957L17.0875 5.32949L18.3592 4.04823L18.9946 4.68941Z" fill="currentColor"/>
<path d="M16.439 8.02026C17.4851 9.07467 18.074 10.5048 18.074 11.9956C18.0738 13.4864 17.4851 14.9166 16.439 15.971L15.8037 16.611L14.532 15.3309L15.1684 14.6908C15.8775 13.9761 16.2754 13.0061 16.2755 11.9956C16.2755 10.9851 15.8773 10.0152 15.1684 9.30042L14.532 8.66034L15.8037 7.37907L16.439 8.02026Z" fill="currentColor"/>
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

SmSoundSolidIcon.displayName = "SmSoundSolidIcon";

export { SmSoundSolidIcon };
