export default function Header() {
  return (
    <header class="flex">
      <a href="/" class="flex items-center gap-2 hover:text-sky-500 m-4">
        <img class="size-8 rounded-full" src="/avatar.webp" alt="logo" />
        <span class="text-xl">Simple B2 List</span>
      </a>
    </header>
  );
}
