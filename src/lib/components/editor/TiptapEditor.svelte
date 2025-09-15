<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import BubbleMenu from "@tiptap/extension-bubble-menu";

  let editor: Editor | null = null;
  export let content: string = "<p>Hello World!</p>";
  export let onUpdate: (html: string) => void = () => {};

  onMount(() => {
    editor = new Editor({
      element: document.querySelector("#editor") as HTMLElement,
      extensions: [
        StarterKit,
        BubbleMenu.configure({
          element: document.querySelector("#bubble-menu") as HTMLElement,
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

  function toggleBold() {
    editor?.chain().focus().toggleBold().run();
  }

  function toggleItalic() {
    editor?.chain().focus().toggleItalic().run();
  }
</script>

<!-- Bubble menu element -->
<div
  id="bubble-menu"
  class="hidden absolute z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 space-x-2"
>
  <button
    on:click={toggleBold}
    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
  >
    B
  </button>
  <button
    on:click={toggleItalic}
    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 italic"
  >
    I
  </button>
</div>

<!-- Main editor -->
<div
  id="editor"
  class="prose dark:prose-invert max-w-full min-h-[200px] h-[435px] border rounded-lg p-4 focus:outline-none"
  contenteditable="true"
></div>

<style>
  #editor:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }

  :global(prosemirror){
    width: 500px;
  }
</style>
