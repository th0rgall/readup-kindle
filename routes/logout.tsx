import { Handlers } from "$fresh/server.ts";
import { MWState } from "./_middleware.ts";
import { rFetch } from "../lib/readup-api.ts";

export const handler: Handlers<any, MWState> = {
  async POST(req, ctx) {
    if (ctx.state.sessionCookie) {
      // todo: this may be missing an installationID prop
      const response = await rFetch("/UserAccounts/SignOut", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          installationId: null,
        }),
      }, ctx);

      console.log(response.status);

      // Clear the cookie
      const headers = new Headers({
        "Set-Cookie": `sessionKey=;path=/;expires=${new Date(0).toUTCString()}`,
        "Location": "/",
      });

      // Set state (not sure if this is useful though)
      ctx.state.sessionCookie = "";

      return new Response("OK", {
        status: 200,
        headers,
      });
    } else {
      return new Response("Not logged in", { status: 400 });
    }
  },
};

export default function SignOut() {
  return (
    <div class="w-full h-full max-w-xs mx-auto my-4">
      <p>Use the logout button</p>
    </div>
  );
}
