import { forwardRef } from "react";
import type { SVGProps } from "react";

const SmPlusSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
<path d="M11.1 16.5H12.9V12.9H16.5V11.1H12.9V7.5H11.1V11.1H7.5V12.9H11.1V16.5ZM12 21C10.755 21 9.585 20.7638 8.49 20.2912C7.395 19.8187 6.4425 19.1775 5.6325 18.3675C4.8225 17.5575 4.18125 16.605 3.70875 15.51C3.23625 14.415 3 13.245 3 12C3 10.755 3.23625 9.585 3.70875 8.49C4.18125 7.395 4.8225 6.4425 5.6325 5.6325C6.4425 4.8225 7.395 4.18125 8.49 3.70875C9.585 3.23625 10.755 3 12 3C13.245 3 14.415 3.23625 15.51 3.70875C16.605 4.18125 17.5575 4.8225 18.3675 5.6325C19.1775 6.4425 19.8187 7.395 20.2912 8.49C20.7638 9.585 21 10.755 21 12C21 13.245 20.7638 14.415 20.2912 15.51C19.8187 16.605 19.1775 17.5575 18.3675 18.3675C17.5575 19.1775 16.605 19.8187 15.51 20.2912C14.415 20.7638 13.245 21 12 21Z" fill="currentColor"/>
    </svg>
  )
);

SmPlusSolidIcon.displayName = "SmPlusSolidIcon";

export { SmPlusSolidIcon };
