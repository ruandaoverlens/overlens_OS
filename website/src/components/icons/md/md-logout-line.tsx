import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdLogoutLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M7.21211 6.38789H14.5871V8.71211H7.1877V23.3127H14.5871V25.6125H7.21211C6.56804 25.6124 6.0198 25.3858 5.5666 24.9328C5.11368 24.4796 4.88789 23.9314 4.88789 23.2873V8.7375C4.88789 8.08646 5.11362 7.53247 5.5666 7.07442C6.01982 6.61642 6.56813 6.38799 7.21211 6.38789ZM27.1018 16.0373L21.8869 21.2512L20.2482 19.6369L22.6555 17.2053L22.6975 17.1623H14.3625V14.8625H22.6477L22.6057 14.8195L20.1975 12.3879L21.8361 10.7717L27.1018 16.0373Z" fill="currentColor" stroke="white" strokeWidth="0.05"/>
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

MdLogoutLineIcon.displayName = "MdLogoutLineIcon";

export { MdLogoutLineIcon };
