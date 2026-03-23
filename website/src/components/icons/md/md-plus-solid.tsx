import { forwardRef } from "react";
import type { SVGProps } from "react";

const MdPlusSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
<path d="M14.8 22H17.2V17.2H22V14.8H17.2V10H14.8V14.8H10V17.2H14.8V22ZM16 28C14.34 28 12.78 27.685 11.32 27.055C9.86 26.425 8.59 25.57 7.51 24.49C6.43 23.41 5.575 22.14 4.945 20.68C4.315 19.22 4 17.66 4 16C4 14.34 4.315 12.78 4.945 11.32C5.575 9.86 6.43 8.59 7.51 7.51C8.59 6.43 9.86 5.575 11.32 4.945C12.78 4.315 14.34 4 16 4C17.66 4 19.22 4.315 20.68 4.945C22.14 5.575 23.41 6.43 24.49 7.51C25.57 8.59 26.425 9.86 27.055 11.32C27.685 12.78 28 14.34 28 16C28 17.66 27.685 19.22 27.055 20.68C26.425 22.14 25.57 23.41 24.49 24.49C23.41 25.57 22.14 26.425 20.68 27.055C19.22 27.685 17.66 28 16 28Z" fill="currentColor"/>
    </svg>
  )
);

MdPlusSolidIcon.displayName = "MdPlusSolidIcon";

export { MdPlusSolidIcon };
