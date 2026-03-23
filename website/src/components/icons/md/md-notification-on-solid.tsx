import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdNotificationOnSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M21.1064 27H9.10645V25H21.1064V27Z" fill="currentColor"/>
<path d="M14.6826 5.25977C15.9934 5.18797 17.3008 5.45062 18.4824 6.02246C17.9286 6.88038 17.6064 7.90216 17.6064 9C17.6065 10.4155 18.1528 11.7765 19.1309 12.7998C20.1089 13.823 21.4435 14.43 22.8574 14.4941V17.8232L25.3203 22.75H4.89355L7.35645 17.8232V13C7.35611 11.6873 7.68892 10.3958 8.32422 9.24707C8.95954 8.09833 9.87716 7.1301 10.9893 6.43262C12.1013 5.73526 13.372 5.33157 14.6826 5.25977Z" fill="currentColor"/>
<path d="M23.1064 5C24.1673 5 25.1844 5.42176 25.9346 6.17188C26.6847 6.92202 27.1064 7.93913 27.1064 9C27.1064 10.0609 26.6847 11.078 25.9346 11.8281C25.1844 12.5782 24.1673 13 23.1064 13C22.0456 13 21.0284 12.5782 20.2783 11.8281C19.5282 11.078 19.1064 10.0608 19.1064 9C19.1064 7.93916 19.5282 6.92202 20.2783 6.17188C21.0284 5.42176 22.0456 5.00003 23.1064 5Z" fill="currentColor"/>
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

MdNotificationOnSolidIcon.displayName = "MdNotificationOnSolidIcon";

export { MdNotificationOnSolidIcon };
