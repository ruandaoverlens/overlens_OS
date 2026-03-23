import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdVerifiedShieldSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M16.085 4.51758L26 6.59766V14.8027C25.9997 17.7939 25.0112 20.6922 23.2031 23.0039C21.3949 25.3157 18.8784 26.8983 16.084 27.4824L16 27.5L15.916 27.4824C13.1216 26.8983 10.6051 25.3157 8.79688 23.0039C6.98885 20.6922 6.00034 17.7939 6 14.8027V6.59766L15.915 4.51758L16 4.5L16.085 4.51758ZM15.4512 17.8047C15.4456 17.8121 15.4373 17.8207 15.4258 17.8271C15.4139 17.8337 15.3994 17.8376 15.3838 17.8389C15.3679 17.84 15.3518 17.8373 15.3379 17.832L15.3057 17.8115L11.6348 14.0391L10.4229 15.3574L14.0928 19.1289C14.2788 19.3202 14.5013 19.4673 14.7441 19.5605C14.9866 19.6536 15.245 19.6924 15.502 19.6738C15.7591 19.6551 16.0109 19.579 16.2393 19.4512C16.4678 19.3232 16.6702 19.1453 16.8291 18.9277L22.4365 11.2373L21.0596 10.1152L15.4512 17.8047Z" fill="currentColor"/>
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

MdVerifiedShieldSolidIcon.displayName = "MdVerifiedShieldSolidIcon";

export { MdVerifiedShieldSolidIcon };
