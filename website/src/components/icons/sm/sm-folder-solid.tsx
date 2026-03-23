import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmFolderSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M19.2 20C19.6774 20 20.1352 19.8017 20.4728 19.4487C20.8104 19.0957 21 18.6169 21 18.1176V8.70588C21 8.20665 20.8104 7.72787 20.4728 7.37486C20.1352 7.02185 19.6774 6.82353 19.2 6.82353H12.09C11.789 6.82662 11.492 6.75069 11.2263 6.60271C10.9605 6.45473 10.7346 6.23941 10.569 5.97647L9.84 4.84706C9.6761 4.5868 9.45298 4.37316 9.19065 4.22531C8.92832 4.07747 8.635 4.00005 8.337 4H4.8C4.32261 4 3.86477 4.19832 3.52721 4.55133C3.18964 4.90434 3 5.38312 3 5.88235V18.1176C3 18.6169 3.18964 19.0957 3.52721 19.4487C3.86477 19.8017 4.32261 20 4.8 20H19.2Z" fill="currentColor"/>
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

SmFolderSolidIcon.displayName = "SmFolderSolidIcon";

export { SmFolderSolidIcon };
