import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmNotificationLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M17.083 20.7998H7.0957V19.2002H17.083V20.7998Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M12 3.2002C15.5252 3.2002 18.3828 6.05781 18.3828 9.58301V13.3574L20.7783 17.5605H3.22168L5.61719 13.3574V9.58301C5.61719 6.05781 8.47481 3.2002 12 3.2002ZM12 4.7998C9.35847 4.7998 7.2168 6.94146 7.2168 9.58301V13.7832L5.97559 15.9609H18.0244L16.7832 13.7832V9.58301C16.7832 6.94146 14.6416 4.79981 12 4.7998Z" fill="currentColor"/>
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

SmNotificationLineIcon.displayName = "SmNotificationLineIcon";

export { SmNotificationLineIcon };
