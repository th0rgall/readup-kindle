import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
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
    if (req.headers.get("Cookie") && !force) {
      return new Response(
        null,
        {
          status: 303,
          headers: {
            Location: "/list",
          },
        },
      );
    }
    return await ctx.render();
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    const response = await fetch("https://api.readup.org/UserAccounts/SignIn", {
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

    // Add email to list.

    // Redirect user to thank you page.
    console.log("");
    const headers = new Headers({
      "Set-Cookie": transformedReturnCookie || "",
      "Location": "/list",
    });
    return new Response(null, {
      status: 303, // See Other
      headers,
    });
  },
};

export default function SignIn() {
  return (
    <div class="w-full max-w-xs">
      <form method="POSt" class="rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label
            htmlFor="email"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            class="appearance-none border border-900 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            type="email"
            name="email"
            id="email"
            value=""
          />
        </div>
        <div>
          <label
            htmlFor="password"
            id="password"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          {/*  */}
          <input
            class="appearance-none border border-900 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            type=""
            id="password"
            name="password"
            value=""
          />
        </div>
        <button type="submit">Log in</button>
      </form>
    </div>
  );
}
