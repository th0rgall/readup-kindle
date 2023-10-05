import { ComponentChildren } from "preact";
import Button from "./ui/Button.tsx";
import { apply, css } from "twind/css";
import { State } from "../routes/_app.tsx";
import FormIconButton from "./ui/FormIconButton.tsx";
import { TITLE } from "../lib/constants.ts";
export default function Scaffold(
  { children }: { children: ComponentChildren },
) {
  return (
    <State.Consumer>
      {({ hasAuth }) => (
        <div class="px-6 py-4 max-w-3xl mx-auto justify-center">
          <div class="overflow-auto">
            <h1 class="text-2xl font-bold float-left">{TITLE}</h1>
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
                    href="/logout"
                    iconName="logout"
                  />
                </form>
              )}
          </div>
          <div class={css({ "&": { article: apply`mb-3` } })}>
            {children}
          </div>
          {hasAuth
            ? (
              <nav class="w-full fixed bottom-0 left-0 bg-white py-3 text(lg center) font(semibold)">
                <a href="/">AOTD</a> | <a href="/my-reads">My Reads</a>
              </nav>
            )
            : null}
        </div>
      )}
    </State.Consumer>
  );
}
