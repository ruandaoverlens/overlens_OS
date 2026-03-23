import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdNoSoundLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M14.2969 3.60203C14.5598 3.26616 15.0069 3.13392 15.4102 3.27293C15.8134 3.41206 16.084 3.79166 16.084 4.21825V27.7817C16.084 28.2082 15.8133 28.5879 15.4102 28.727C15.0068 28.8661 14.5598 28.7339 14.2969 28.3979L8.32422 20.7641H3.79297C3.2408 20.7641 2.79316 20.3163 2.79297 19.7641V12.2368C2.79297 11.6845 3.24068 11.2368 3.79297 11.2368H8.32324L14.2969 3.60203ZM9.59863 12.853C9.40916 13.095 9.11886 13.2367 8.81152 13.2368H4.79297V18.7641H8.81152L8.92578 18.77C9.18999 18.8004 9.43282 18.936 9.59863 19.1479L14.084 24.8794V7.11961L9.59863 12.853Z" fill="currentColor"/>
<path d="M29.207 12.2368L25.4434 16.0005L29.207 19.7641L27.793 21.1782L24.0293 17.4145L20.2656 21.1782L18.8516 19.7641L22.6152 16.0005L18.8516 12.2368L20.2656 10.8227L24.0293 14.5864L27.793 10.8227L29.207 12.2368Z" fill="currentColor"/>
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

MdNoSoundLineIcon.displayName = "MdNoSoundLineIcon";

export { MdNoSoundLineIcon };
