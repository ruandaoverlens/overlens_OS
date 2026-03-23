import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmBookmarkLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path fillRule="evenodd" clipRule="evenodd" d="M18.5273 16.6182H17.2539V18.2002H18.3633V19.7998H7.86328C6.6253 19.7998 5.60669 18.859 5.48438 17.6533L5.47266 17.4092V6.90918C5.47266 5.41299 6.68545 4.2002 8.18164 4.2002H18.5273V16.6182ZM7.86328 16.6182C7.42652 16.6182 7.07227 16.9724 7.07227 17.4092L7.07617 17.4902C7.11678 17.8889 7.4539 18.2002 7.86328 18.2002H15.6543V16.6182H7.86328ZM8.18164 5.7998C7.56911 5.7998 7.07227 6.29665 7.07227 6.90918V15.1543C7.32004 15.0674 7.58581 15.0186 7.86328 15.0186H16.9268V5.7998H15.3447V11.6934L12.6357 10.3623L9.92676 11.6934V5.7998H8.18164ZM11.5264 9.125L12.2832 8.75391L12.6357 8.58008L12.9883 8.75391L13.7451 9.125V5.7998H11.5264V9.125Z" fill="currentColor"/>
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

SmBookmarkLineIcon.displayName = "SmBookmarkLineIcon";

export { SmBookmarkLineIcon };
