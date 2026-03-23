import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdAlertSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M16.0132 5.61617C16.4859 5.61538 16.9513 5.73445 17.3647 5.96382C17.7795 6.19397 18.1287 6.52635 18.3784 6.92964L28.0981 22.5214C28.3511 22.9227 28.485 23.3869 28.4858 23.8613V23.8632C28.4858 24.5319 28.2204 25.1736 27.7476 25.6464C27.2747 26.1192 26.633 26.3847 25.9644 26.3847H6.05811C5.72807 26.3877 5.4005 26.3253 5.09424 26.2021C4.78456 26.0774 4.5028 25.8926 4.26514 25.6582C4.0274 25.4236 3.83831 25.144 3.70947 24.8359C3.58067 24.5278 3.51417 24.1972 3.51416 23.8632V23.8613C3.51499 23.3848 3.65064 22.9181 3.90576 22.5156L13.646 6.92671C13.8956 6.52476 14.244 6.19339 14.6577 5.96382C15.0709 5.73459 15.5359 5.61552 16.0083 5.61617H16.0112L16.0142 5.61519L16.0132 5.61617ZM15.0112 20.9003V23.5H17.0112V20.9003H15.0112ZM15.0112 19.5937H17.0112V10.5H15.0112V19.5937Z" fill="currentColor"/>
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

MdAlertSolidIcon.displayName = "MdAlertSolidIcon";

export { MdAlertSolidIcon };
