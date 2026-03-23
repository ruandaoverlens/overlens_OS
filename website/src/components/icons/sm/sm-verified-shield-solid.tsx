import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmVerifiedShieldSolidIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M12.0679 3.01433L20 4.6422V11.063C19.9998 13.4042 19.2088 15.6725 17.7622 17.4818C16.3157 19.291 14.3028 20.529 12.0673 20.9862L12 21.0003L11.9327 20.9862C9.6972 20.529 7.68434 19.291 6.23777 17.4818C4.79118 15.6725 4.00022 13.4042 4 11.063V4.6422L11.9321 3.01433L12 3.00027L12.0679 3.01433ZM11.5611 13.4123C11.5567 13.4182 11.5501 13.4247 11.5408 13.4299C11.5312 13.4351 11.5195 13.4388 11.5068 13.4397C11.494 13.4406 11.4812 13.4383 11.4701 13.4341L11.4443 13.4179L8.50815 10.4657L7.53804 11.4971L10.4742 14.4493C10.623 14.599 10.801 14.7136 10.9952 14.7866C11.1894 14.8595 11.3961 14.8897 11.6019 14.8751C11.8077 14.8604 12.0088 14.801 12.1916 14.7008C12.3745 14.6007 12.5359 14.4615 12.663 14.2912L17.1495 8.27297L16.0476 7.39475L11.5611 13.4123Z" fill="currentColor"/>
</g>
<defs>
<clipPath id={`${clipId}`}>
<rect width="24" height="24.0003" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

SmVerifiedShieldSolidIcon.displayName = "SmVerifiedShieldSolidIcon";

export { SmVerifiedShieldSolidIcon };
