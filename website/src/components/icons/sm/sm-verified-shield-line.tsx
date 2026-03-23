import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmVerifiedShieldLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M16.2002 9.92969L11.0938 15.0449L7.7998 11.751L8.93066 10.6191L11.0918 12.7803L15.0674 8.79883L16.2002 9.92969Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M20.0762 4.7998V11.1318C20.0759 13.4082 19.2865 15.6141 17.8428 17.374C16.3988 19.1341 14.3889 20.3392 12.1562 20.7842L12 20.8154L11.8438 20.7842C9.61101 20.3392 7.60127 19.1341 6.15723 17.374C4.71337 15.6141 3.92411 13.4083 3.92383 11.1318V4.7998L11.8428 3.21582L12 3.18457L20.0762 4.7998ZM5.52344 6.11035V11.1318C5.52372 13.0383 6.1853 14.8855 7.39453 16.3594C8.56979 17.7918 10.1923 18.7838 11.999 19.1807C13.8063 18.784 15.4299 17.7923 16.6055 16.3594C17.8146 14.8855 18.4753 13.0382 18.4756 11.1318V6.11035L11.999 4.81543L5.52344 6.11035Z" fill="currentColor"/>
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

SmVerifiedShieldLineIcon.displayName = "SmVerifiedShieldLineIcon";

export { SmVerifiedShieldLineIcon };
