import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const MdQuestionLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M16.124 20.083C16.7349 20.1452 17.2119 20.6619 17.2119 21.2891C17.2116 21.958 16.6688 22.4999 16 22.5L15.8838 22.4941C15.31 22.4394 14.852 21.9849 14.7939 21.4121L14.7881 21.2891L14.7939 21.165C14.8559 20.5541 15.3728 20.0773 16 20.0771L16.124 20.083Z" fill="currentColor"/>
<path d="M16 9.5C18.1877 9.5002 19.9609 11.2741 19.9609 13.4619C19.9608 15.304 18.7034 16.8517 17 17.2949V18.5381C17 19.0902 16.5521 19.5379 16 19.5381C15.4479 19.5379 15 19.0902 15 18.5381V16.4229C15.0001 15.8708 15.448 15.423 16 15.4229C17.083 15.4226 17.9607 14.5449 17.9609 13.4619C17.9609 12.3787 17.0832 11.5002 16 11.5C14.9168 11.5002 14.0381 12.3787 14.0381 13.4619C14.0379 14.014 13.5902 14.4619 13.0381 14.4619C12.4861 14.4617 12.0383 14.0139 12.0381 13.4619C12.0381 11.2741 13.8123 9.5002 16 9.5Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M16 4C22.6275 4 28 9.37259 28 16C28 22.6275 22.6275 28 16 28C9.37259 28 4 22.6275 4 16C4 9.37258 9.37258 4 16 4ZM16 6C10.4772 6 6 10.4772 6 16C6 21.5229 10.4771 26 16 26C21.5229 26 26 21.5229 26 16C26 10.4771 21.5229 6 16 6Z" fill="currentColor"/>
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

MdQuestionLineIcon.displayName = "MdQuestionLineIcon";

export { MdQuestionLineIcon };
