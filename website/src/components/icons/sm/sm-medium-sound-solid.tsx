import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmMediumSoundSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M12.6491 2.42575C12.9374 2.05321 13.427 1.90646 13.8682 2.06117C14.3094 2.21594 14.6049 2.63786 14.605 3.1115V20.889C14.605 21.3627 14.3094 21.7845 13.8682 21.9393C13.4269 22.0941 12.9374 21.9474 12.6491 21.5748L8.30317 15.9574H5.09504C4.49027 15.9574 4 15.46 4 14.8464V9.15416C4.00009 8.5406 4.49032 8.04307 5.09504 8.04307H8.30317L12.6491 2.42575Z" fill="currentColor"/>
<path d="M18.3745 8.01377C19.4152 9.07003 20 10.5024 20 11.9959C20 13.4894 19.4152 14.9218 18.3745 15.9781L17.7554 16.6063L16.516 15.3498L17.1362 14.7216C17.8484 13.9987 18.2483 13.018 18.2484 11.9959C18.2484 10.9738 17.8484 9.99313 17.1362 9.27026L16.516 8.64202L17.7554 7.38444L18.3745 8.01377Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24.0003" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmMediumSoundSolidIcon.displayName = "SmMediumSoundSolidIcon";

export { SmMediumSoundSolidIcon };
