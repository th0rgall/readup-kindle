import { apply, css } from "twind/css";
import type { FunctionComponent } from "preact";
import type { IconName } from "../Icon.tsx";
import Icon from "../Icon.tsx";
export default (({ className, href, iconName }) => (
  <span
    class={css([
      apply`inline items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400`,
      className,
    ])}
  >
    <input
      type="submit"
      value={"Log out"}
      class="mr-1"
      style={{ background: "none" }}
      href={href}
    >
      <Icon className="inline-block" iconName={iconName}></Icon>
    </input>
  </span>
)) satisfies FunctionComponent<
  { className?: string; href: string; iconName: IconName }
>;
