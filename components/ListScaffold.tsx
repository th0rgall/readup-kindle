import { ComponentChildren, h } from "preact";
export default function Scaffold(
  { children }: { children: ComponentChildren },
) {
  return (
    <div class="px-6 py-4 max-w-3xl mx-auto justify-center">
      <h1 class="text-2xl font-bold">Readup</h1>
      <div>
        {children}
      </div>
      <nav class="w-full fixed bottom-0 left-0 bg-white py-3 text(center) font(bold)">
        <a href="/list">AOTD</a> | <a href="/my-reads">My Reads</a>
      </nav>
    </div>
  );
}
