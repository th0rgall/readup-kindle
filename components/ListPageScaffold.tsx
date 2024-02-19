import { ComponentChildren } from "preact";
import Button from "./ui/Button.tsx";
import { apply, css } from "twind/css";
import { State } from "../routes/_app.tsx";
import FormIconButton from "./ui/FormIconButton.tsx";
import { TITLE } from "../lib/constants.ts";
import { PageProps } from "$fresh/server.ts";
import { inputClass, labelClass } from "../lib/style.ts";
export const activeNavClass = "font(semibold) text(xl)";
export const inactiveNavClass = "font(normal) text(gray-700)";
export default function Scaffold(
  { children, ctx }: { children: ComponentChildren; ctx: PageProps<any> },
) {
  return (
    <State.Consumer>
      {({ hasAuth, isKindle }) => (
        <div class="px-6 py-4 max-w-3xl mx-auto justify-center">
          <div class="overflow-auto">
            <h1 class="text(2xl gray-600) mt-0.5 font-light float-left font-serif block">
              {TITLE}
            </h1>
            {!hasAuth
              ? (
                <Button
                  href="/login"
                  className={apply("float-right")}
                >
                  Login
                </Button>
              )
              : (
                <form method="POST" action="/logout">
                  <FormIconButton
                    className={apply("float-right")}
                    iconName="logout"
                    value="Log out"
                  />
                </form>
              )}
          </div>
          {/* Show an article adder for non-Kindle */}
          {!isKindle && hasAuth
            ? (
              <div>
                <form
                  method="POST"
                  action="/ink/add"
                  class="w-full flex items-center"
                >
                  <label
                    class={`${labelClass} flex flex-col flex-grow mr-4`}
                    htmlFor="url"
                  >
                    <span class="font-medium">Open this article URL</span>
                    <input
                      // todo: make TW-reusable input class that doesn't have mb in it
                      class="appearance-none border border-900 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      minLength={4}
                      name="url"
                      id="url"
                    />
                  </label>
                  <FormIconButton value="Add" />
                </form>
              </div>
            )
            : <></>}
          <div class="overflow-auto">
            <nav class="float-left bg-white py-3 text(lg center) ">
              <a
                class={ctx.route === "/" ? activeNavClass : inactiveNavClass}
                href="/"
              >
                Article of the Day
              </a>
              {hasAuth
                ? (
                  <>
                    {" "}
                    |{" "}
                    <a
                      class={ctx.route === "/myreads"
                        ? activeNavClass
                        : inactiveNavClass}
                      href="/myreads"
                    >
                      Starred
                    </a>{" "}
                    |{" "}
                    <a
                      class={ctx.route === "/history"
                        ? activeNavClass
                        : inactiveNavClass}
                      href="/history"
                    >
                      My History
                    </a>
                  </>
                )
                : null}
            </nav>
          </div>
          <div class={css({ "&": { article: apply`mb-3` } })}>
            {children}
          </div>
        </div>
      )}
    </State.Consumer>
  );
}
