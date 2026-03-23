import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdNotificationLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M22.9878 28H9.25537V26H22.9878V28Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M15.9995 4C20.7914 4 24.6763 7.88484 24.6763 12.6768V17.8936L27.8979 23.5469H4.10205L7.32275 17.8955V12.6768C7.32275 7.88488 11.2077 4.00006 15.9995 4ZM15.9995 6C12.3122 6.00006 9.32275 8.98944 9.32275 12.6768V18.4248L9.19189 18.6553L7.54443 21.5469H24.4556L22.8071 18.6553L22.6763 18.4248V12.6768C22.6763 8.9894 19.6869 6 15.9995 6Z" fill="currentColor"/>
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

MdNotificationLineIcon.displayName = "MdNotificationLineIcon";

export { MdNotificationLineIcon };
