<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import BubbleMenu from "@tiptap/extension-bubble-menu";
  import Underline from "@tiptap/extension-underline"; // Extra extension
  import Code from "@tiptap/extension-code";           // Extra extension

  let editor: Editor | null = null;
  export let content: string = "<p>Hello World!</p>";
  export let onUpdate: (html: string) => void = () => {};

  onMount(() => {
    editor = new Editor({
      element: document.querySelector("#editor") as HTMLElement,
      extensions: [
        StarterKit,
        Underline,
        Code,
        BubbleMenu.configure({
          element: document.querySelector("#bubble-menu") as HTMLElement,
          tippyOptions: {
            duration: 100,
            animation: "shift-away",
          },
        }),
      ],
      content,
      onUpdate: ({ editor }) => {
        onUpdate(editor.getHTML());
      },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });

  // Bubble menu actions
  function toggleBold() { editor?.chain().focus().toggleBold().run(); }
  function toggleItalic() { editor?.chain().focus().toggleItalic().run(); }
  function toggleUnderline() { editor?.chain().focus().toggleUnderline().run(); }
  function toggleStrike() { editor?.chain().focus().toggleStrike().run(); }
  function toggleCode() { editor?.chain().focus().toggleCode().run(); }
  function toggleBulletList() { editor?.chain().focus().toggleBulletList().run(); }
  function toggleOrderedList() { editor?.chain().focus().toggleOrderedList().run(); }
  function toggleHeading(level: number) { editor?.chain().focus().toggleHeading({ level }).run(); }
</script>

<!-- Bubble menu -->
<div
  id="bubble-menu"
  class="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 space-x-1 flex flex-wrap"
>
  <button on:click={toggleBold} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 font-bold">B</button>
  <button on:click={toggleItalic} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 italic">I</button>
  <button on:click={toggleUnderline} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 underline">U</button>
  <button on:click={toggleStrike} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 line-through">S</button>
  <button on:click={toggleCode} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 font-mono">{"<>"}</button>
  <button on:click={() => toggleHeading(1)} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">H1</button>
  <button on:click={() => toggleHeading(2)} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">H2</button>
  <button on:click={toggleBulletList} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">• List</button>
  <button on:click={toggleOrderedList} class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">1. List</button>
</div>

<!-- Editor -->
<div
  id="editor"
  class="prose dark:prose-invert max-w-full min-h-[200px] h-[435px] border rounded-lg p-4 focus:outline-none"
></div>

<style>
  #editor:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
</style>
