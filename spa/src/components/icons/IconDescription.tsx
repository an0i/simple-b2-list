import type { JSX } from 'solid-js';

export default (
  props: JSX.IntrinsicAttributes & JSX.SvgSVGAttributes<SVGSVGElement>,
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
    >
      <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520h200L520-800v200Z" />
    </svg>
  );
};
