import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdSoundLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M13.9629 3.6338C14.2257 3.29748 14.6736 3.16477 15.0771 3.30372C15.4805 3.44279 15.751 3.82238 15.751 4.24904V27.751C15.7509 28.1776 15.4804 28.5573 15.0771 28.6963C14.6737 28.8352 14.2257 28.7025 13.9629 28.3662L8.0127 20.75H3.5C2.94778 20.75 2.5001 20.3022 2.5 19.75V12.25C2.5 11.6977 2.94772 11.25 3.5 11.25H8.0127L13.9629 3.6338ZM9.28906 12.8652C9.09963 13.1076 8.8086 13.2499 8.50098 13.25H4.5V18.75H8.50098L8.61523 18.7568C8.8796 18.7873 9.12328 18.9226 9.28906 19.1348L13.751 24.8467V7.15236L9.28906 12.8652Z" fill="currentColor"/>
<path d="M25.5469 6.45411C28.0779 8.98593 29.4999 12.42 29.5 16C29.4999 19.5799 28.0778 23.0132 25.5469 25.5449L24.8398 26.252L23.4258 24.8379L24.1328 24.1309C26.2887 21.9742 27.4999 19.0495 27.5 16C27.4999 12.9504 26.2889 10.0249 24.1328 7.86818L23.4258 7.16115L24.8398 5.74708L25.5469 6.45411Z" fill="currentColor"/>
<path d="M21.1338 10.8672C22.4929 12.2268 23.2567 14.0708 23.2568 15.9932C23.2568 17.9158 22.4931 19.7604 21.1338 21.1201L20.4268 21.8272L19.0127 20.4131L19.7197 19.7061C20.7041 18.7214 21.2568 17.3855 21.2568 15.9932C21.2567 14.6011 20.7039 13.2658 19.7197 12.2813L19.0127 11.5742L20.4268 10.1602L21.1338 10.8672Z" fill="currentColor"/>
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

MdSoundLineIcon.displayName = "MdSoundLineIcon";

export { MdSoundLineIcon };
