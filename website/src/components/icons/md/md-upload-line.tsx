import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdUploadLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M7.3761 19.8575V24.6241H24.6163V19.8575H26.8448V24.5988C26.8448 25.2047 26.6215 25.7307 26.174 26.1769C25.7267 26.6226 25.1995 26.8448 24.5909 26.8448H7.40149C6.79512 26.8448 6.26907 26.6228 5.82336 26.1769C5.37741 25.7311 5.1554 25.2052 5.1554 24.5988V19.8575H7.3761ZM22.6798 11.8497L21.0831 13.4386L17.1495 9.49719L17.1066 9.45422V21.4738H14.8849V9.45422L14.8429 9.49719L10.9073 13.4396L9.31067 11.8497L15.9952 5.16516L22.6798 11.8497Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdUploadLineIcon.displayName = "MdUploadLineIcon";

export { MdUploadLineIcon };
