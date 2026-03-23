import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmNoSoundLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M10.5149 2.35414C10.7612 2.0437 11.1801 1.92212 11.5579 2.05061C11.9358 2.17921 12.1893 2.52965 12.1893 2.92397V21.0751C12.1892 21.4695 11.9359 21.8211 11.5579 21.9496C11.1801 22.078 10.7612 21.9554 10.5149 21.6449L5.89878 15.8236H2.43671C1.91931 15.8236 1.5001 15.4088 1.5 14.8984V9.10073C1.5 8.59022 1.91925 8.17659 2.43671 8.17659H5.89878L10.5149 2.35414ZM7.09283 9.67057C6.91529 9.89419 6.64306 10.0248 6.35513 10.0249H3.37343V13.9742H6.35513L6.46149 13.981C6.70928 14.009 6.93735 14.1336 7.09283 14.3297L10.3159 18.393V5.60501L7.09283 9.67057Z" fill="currentColor"/>
<path d="M22.5 9.10073L19.5606 11.9995L21.8378 14.245L22.5 14.8995L21.1756 16.2062L20.5122 15.5528L18.2362 13.3062L15.2979 16.2062L13.9724 14.8995L16.9106 11.9995L14.6357 9.75407L13.9724 9.10073L15.2979 7.79294L15.9602 8.4474L18.2362 10.6918L21.1756 7.79294L22.5 9.10073Z" fill="currentColor"/>
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

SmNoSoundLineIcon.displayName = "SmNoSoundLineIcon";

export { SmNoSoundLineIcon };
