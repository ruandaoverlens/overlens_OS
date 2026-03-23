import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmInfoLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M12.9089 17.2669H11.0911V12.3917H10.3465V10.574H12.9089V17.2669Z" fill="currentColor"/>
<path d="M12.8223 8.77949H11.1777V6.96171H12.8223V8.77949Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M12 2C14.6522 2 17.196 3.05324 19.0714 4.92864C20.9468 6.80405 22 9.34778 22 12C22 14.6522 20.9468 17.196 19.0714 19.0714C17.196 20.9468 14.6522 22 12 22C9.34778 22 6.80405 20.9468 4.92864 19.0714C3.05324 17.196 2 14.6522 2 12C2 9.34778 3.05324 6.80405 4.92864 4.92864C6.80405 3.05324 9.34778 2 12 2ZM12 3.81778C9.83 3.81778 7.74927 4.68043 6.21485 6.21485C4.68043 7.74927 3.81778 9.83 3.81778 12C3.81778 14.17 4.68043 16.2507 6.21485 17.7852C7.74927 19.3196 9.83 20.1822 12 20.1822C14.17 20.1822 16.2507 19.3196 17.7852 17.7852C19.3196 16.2507 20.1822 14.17 20.1822 12C20.1822 9.83 19.3196 7.74927 17.7852 6.21485C16.2507 4.68043 14.17 3.81778 12 3.81778Z" fill="currentColor"/>
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

SmInfoLineIcon.displayName = "SmInfoLineIcon";

export { SmInfoLineIcon };
