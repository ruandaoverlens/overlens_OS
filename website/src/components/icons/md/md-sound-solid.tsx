import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdSoundSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M14.4629 3.6338C14.7257 3.29748 15.1736 3.16477 15.5771 3.30372C15.9805 3.44279 16.251 3.82238 16.251 4.24904V27.751C16.2509 28.1776 15.9804 28.5573 15.5771 28.6963C15.1737 28.8352 14.7257 28.7025 14.4629 28.3662L8.5127 20.75H4C3.44778 20.75 3.0001 20.3022 3 19.75V12.25C3 11.6977 3.44772 11.25 4 11.25H8.5127L14.4629 3.6338Z" fill="currentColor"/>
<path d="M25.0469 6.45411C27.5779 8.98593 28.9999 12.42 29 16C28.9999 19.5799 27.5778 23.0132 25.0469 25.5449L24.3398 26.252L22.9258 24.8379L23.6328 24.1309C25.7887 21.9742 26.9999 19.0495 27 16C26.9999 12.9504 25.7889 10.0249 23.6328 7.86818L22.9258 7.16115L24.3398 5.74708L25.0469 6.45411Z" fill="currentColor"/>
<path d="M21.6338 10.8672C22.9929 12.2268 23.7567 14.0708 23.7568 15.9932C23.7568 17.9158 22.9931 19.7604 21.6338 21.1201L20.9268 21.8272L19.5127 20.4131L20.2197 19.7061C21.2041 18.7214 21.7568 17.3855 21.7568 15.9932C21.7567 14.6011 21.2039 13.2658 20.2197 12.2813L19.5127 11.5742L20.9268 10.1602L21.6338 10.8672Z" fill="currentColor"/>
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

MdSoundSolidIcon.displayName = "MdSoundSolidIcon";

export { MdSoundSolidIcon };
