import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmShopLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M14.9165 6.5332C15.3581 6.5333 15.7171 6.89138 15.7173 7.33301C15.7173 9.36328 14.0307 11.0495 12.0005 11.0498C9.97004 11.0498 8.28369 9.36345 8.28369 7.33301C8.28386 6.89132 8.64177 6.5332 9.0835 6.5332C9.52514 6.5333 9.88314 6.89138 9.8833 7.33301C9.8833 8.47979 10.8537 9.44922 12.0005 9.44922C13.1471 9.44893 14.1167 8.47963 14.1167 7.33301C14.1169 6.89143 14.4749 6.53338 14.9165 6.5332Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M17.2964 4.2002C17.9709 4.2002 18.54 4.68465 18.6577 5.33594L18.6753 5.46875L19.6919 17.6699C19.7875 18.8166 18.8824 19.7998 17.7319 19.7998H6.26807C5.11755 19.7998 4.21256 18.8165 4.3081 17.6699L5.32471 5.46875L5.34228 5.33594C5.46005 4.68468 6.02918 4.20022 6.70361 4.2002H17.2964ZM5.90283 17.8027C5.88503 18.0164 6.05355 18.2002 6.26807 18.2002H17.7319C17.9464 18.2002 18.115 18.0164 18.0972 17.8027L17.0972 5.7998H6.90283L5.90283 17.8027Z" fill="currentColor"/>
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

SmShopLineIcon.displayName = "SmShopLineIcon";

export { SmShopLineIcon };
