import type { JSX } from "solid-js";

export default (props: JSX.IntrinsicAttributes & JSX.SvgSVGAttributes<SVGSVGElement>) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
      <path d="M320-200v-560l440 280-440 280Z" />
    </svg>
  );
};
