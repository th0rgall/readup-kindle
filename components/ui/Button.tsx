import { apply, css } from "twind/css";
import type { FunctionComponent } from "preact";
export default (({ children, className, href }) => (
  <a
    type="button"
    href={href}
    class={css([
      apply`rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400`,
      className,
    ])}
  >
    {children}
  </a>
)) satisfies FunctionComponent<{ className?: string; href: string }>;
