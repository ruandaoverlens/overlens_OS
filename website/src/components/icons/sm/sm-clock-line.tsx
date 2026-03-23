import { forwardRef, useId } from "react";
import type { SVGProps } from "react";

const SmClockLineIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
<path d="M12.3005 13.5957L15.2612 16.6075L14.0197 17.8692L10.5459 14.3345V8.90711H12.3005V13.5957Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M12.008 4.74258C14.2575 4.74265 16.4149 5.65145 18.0056 7.26941C19.5963 8.88758 20.4907 11.0829 20.4907 13.3713C20.4905 15.6594 19.5962 17.8541 18.0056 19.4721C16.4149 21.0899 14.2575 21.9999 12.008 22C9.75848 21.9999 7.60013 21.0901 6.00943 19.4721C4.41898 17.8541 3.52558 15.6593 3.52536 13.3713C3.52536 11.083 4.4189 8.88755 6.00943 7.26941C7.60014 5.65131 9.75843 4.74267 12.008 4.74258ZM12.008 6.52738C10.2239 6.52747 8.51251 7.24897 7.25092 8.53228C5.98953 9.81562 5.27995 11.5565 5.27995 13.3713C5.28017 15.186 5.98945 16.9271 7.25092 18.2103C8.51247 19.4934 10.2241 20.214 12.008 20.2141C13.792 20.214 15.5036 19.4933 16.7651 18.2103C18.0266 16.9271 18.7348 15.186 18.735 13.3713C18.735 11.5565 18.0266 9.81563 16.7651 8.53228C15.5035 7.24896 13.7922 6.52745 12.008 6.52738Z" fill="currentColor"/>
<path d="M7.39125 3.39363L3.09582 6.88913L2 5.49551L6.29543 2L7.39125 3.39363Z" fill="currentColor"/>
<path d="M22 5.38654L21.0263 6.87279L16.056 3.5015L17.0297 2.01634L22 5.38654Z" fill="currentColor"/>
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

SmClockLineIcon.displayName = "SmClockLineIcon";

export { SmClockLineIcon };
