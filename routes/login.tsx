import { Handlers, PageProps } from "$fresh/server.ts";
import { apply, tw } from "twind";
import { READUP_API_BASE, TITLE } from "../lib/constants.ts";
import { MWState } from "./_middleware.ts";
import { inputClass, labelClass } from "../lib/style.ts";

const redirect = () =>
  new Response(
    null,
    {
      status: 303,
      headers: {
        Location: "/",
      },
    },
  );

export const handler: Handlers<any, MWState> = {
  async GET(req, ctx) {
    // If we have a cookie
    // TODO: check if the cookie is valid!
    let force = null;
    try {
      const form = await req.formData();
      force = form.get("forcelogin")?.toString();
    } catch (e) {
      //
    }

    // TODO move this logic to middleware
    if (ctx.state.sessionCookie && !force) {
      return redirect();
    }
    return await ctx.render();
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    const response = await fetch(`${READUP_API_BASE}/UserAccounts/SignIn`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        email,
        password,
        "analyticsAction": "Header",
        "pushDevice": null,
      }),
    });

    const host = new URL(req.url).hostname;

    const returnCookieSource = response.headers.get("Set-Cookie");
    const transformedReturnCookie = returnCookieSource?.replaceAll(
      ".readup.org",
      host,
    )
      // todo: fix security here... once we're on https
      .replace(/domain=.*;/, "")
      .replace("secure;", "")
      // the below one wasn't supported by midori, mabye the above too
      .replace("httponly", "");

    // Redirect user
    console.log("");
    const headers = new Headers({
      "Set-Cookie": transformedReturnCookie || "",
      "Location": "/",
    });

    // Set state (not sure if this is useful though)
    ctx.state.sessionCookie = transformedReturnCookie || "";

    return new Response(null, {
      status: 303, // See Other
      headers,
    });
  },
};

export default function SignIn(
  { state: { isKindle } }: PageProps<any, MWState>,
) {
  return (
    <div class="max-w-xs mx-auto mt-10 mb-4">
      <h1 class="text(xl center) font(bold) mb-3">{TITLE}</h1>
      <p class="text-center text-gray-700">
        Log in with your Readup account.
      </p>
      <form method="POST" class="rounded px-8 pt-6 pb-8 mb-4">
        <div>
          <label
            htmlFor="email"
            class={tw(labelClass)}
          >
            Email
          </label>
          <input
            class={tw(inputClass)}
            type="email"
            name="email"
            id="email"
            value=""
          />
        </div>
        <div class="mb-2">
          <label
            htmlFor="password"
            // TODO: Kindle doesn't support the password type (verify)
            id="password"
            class={tw(labelClass)}
          >
            Password
          </label>
          {/*  */}
          <input
            class="appearance-none border border-900 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            type={isKindle ? "text" : "password"}
            id="password"
            name="password"
            value=""
          />
        </div>
        <div class="w-full">
          <button
            class="font-bold py-2 px-4 rounded text(white) mx-auto bg-gray-400"
            type="submit"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  );
}
