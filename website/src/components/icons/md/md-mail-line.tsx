import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdMailLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M26.1055 6.5C26.6106 6.50006 27.0528 6.69037 27.4316 7.07031C27.8105 7.45027 28 7.89381 28 8.40039V23.5996C28 24.0851 27.8105 24.5235 27.4316 24.9141C27.0528 25.3046 26.6106 25.4999 26.1055 25.5H5.89453C5.38934 25.5 4.94726 25.3046 4.56836 24.9141C4.18946 24.5235 4 24.0851 4 23.5996V8.40039C4 7.8938 4.18953 7.45027 4.56836 7.07031C4.94726 6.69036 5.38934 6.50004 5.89453 6.5H26.1055ZM16 19.167L5.89453 10.7432V23.5996H26.1055V10.7432L16 19.167ZM16 16.665L25.9473 8.40039H6.05273L16 16.665Z" fill="currentColor"/>
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

MdMailLineIcon.displayName = "MdMailLineIcon";

export { MdMailLineIcon };
