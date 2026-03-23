import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmMediumSoundLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M12.7216 2.34739C12.9554 2.04261 13.3525 1.92338 13.7104 2.04998C14.0682 2.17664 14.3089 2.52137 14.3089 2.90893V21.0911C14.3089 21.4786 14.0682 21.8233 13.7104 21.95C13.3525 22.0766 12.9554 21.9574 12.7216 21.6526L8.24802 15.8198H4.88799C4.39744 15.8198 4 15.413 4 14.9109V9.08912C4.00002 8.58705 4.39746 8.18024 4.88799 8.18024H8.24802L12.7216 2.34739ZM9.37887 9.65066C9.21049 9.87014 8.95219 9.99801 8.67954 9.99801H5.77597V14.002H8.67954L8.78146 14.0075C9.01571 14.0351 9.23153 14.1573 9.37887 14.3493L12.5318 18.4599V5.53903L9.37887 9.65066Z" fill="currentColor"/>
<path d="M18.352 7.92278C19.407 9.00307 20 10.4681 20 11.9956C19.9999 13.523 19.407 14.9881 18.352 16.0683L17.7242 16.7109L16.4676 15.4258L17.0964 14.7832C17.8185 14.044 18.2239 13.0409 18.224 11.9956C18.224 10.9502 17.8184 9.94718 17.0964 9.20787L16.4676 8.56532L17.7242 7.27912L18.352 7.92278Z" fill="currentColor"/>
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

SmMediumSoundLineIcon.displayName = "SmMediumSoundLineIcon";

export { SmMediumSoundLineIcon };
