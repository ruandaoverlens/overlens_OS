import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdVerifiedShieldLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M21.7051 13.0811L14.7539 20.0439L10.2959 15.5859L11.71 14.1719L14.7529 17.2139L20.2891 11.6689L21.7051 13.0811Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M27.0049 6.18066V14.8057C27.0046 17.9129 25.9269 20.924 23.9561 23.3262C21.9852 25.7284 19.2426 27.3731 16.1953 27.9805L16 28.0195L15.8047 27.9805C12.7574 27.3732 10.0148 25.7284 8.04395 23.3262C6.07305 20.924 4.9954 17.9129 4.99512 14.8057V6.18066L16 3.98047L27.0049 6.18066ZM6.99512 7.82031V14.8057L7.00586 15.3008C7.113 17.7688 8.0173 20.1409 9.58984 22.0576C11.225 24.0506 13.4848 25.4284 16 25.9756C18.5151 25.4284 20.7751 24.0506 22.4102 22.0576C24.0875 20.013 25.0046 17.4503 25.0049 14.8057V7.82031L16 6.01953L6.99512 7.82031Z" fill="currentColor"/>
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

MdVerifiedShieldLineIcon.displayName = "MdVerifiedShieldLineIcon";

export { MdVerifiedShieldLineIcon };
