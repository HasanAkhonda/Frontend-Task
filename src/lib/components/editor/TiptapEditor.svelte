<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Heading from "@tiptap/extension-heading";
  import Underline from "@tiptap/extension-underline";
  import Highlight from "@tiptap/extension-highlight";
  import CodeBlock from "@tiptap/extension-code-block";
  import { Bold, Italic, Type, Code, Highlighter, TypeIcon,UnderlineIcon } from "lucide-svelte";
  import type { Level } from '@tiptap/extension-heading'

  // -----------------------------
  // References to DOM elements
  // -----------------------------
  let element: HTMLDivElement; // Editor container
  let bubbleMenu: HTMLElement;  // Bubble menu container
  let editor: Editor;           // Tiptap Editor instance

  export let content: string = " "; // Initial content

  // -----------------------------
  // Formatting states
  // -----------------------------
  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let isHighlight = false;
  let isCode = false;
  let currentHeading:string | number | [] | any= 0; // 0 = normal, 1 = H1, 2 = H2, 3 = H3

  // -----------------------------
  // Bubble menu position and visibility
  // -----------------------------
  let showMenu = false;
  let menuX = 0;
  let menuY = 0;

  // -----------------------------
  // Update active styles based on current selection
  // -----------------------------
  function updateActiveStyles() {
    if (!editor) return;
    isBold = editor.isActive("bold");
    isItalic = editor.isActive("italic");
    isUnderline = editor.isActive("underline");
    isHighlight = editor.isActive("highlight");
    isCode = editor.isActive("codeBlock");

    // Check which heading is active
    if (editor.isActive("heading", { level: 1 })) currentHeading = 1;
    else if (editor.isActive("heading", { level: 2 })) currentHeading = 2;
    else if (editor.isActive("heading", { level: 3 })) currentHeading = 3;
    else currentHeading = 0;
  }

  // -----------------------------
  // Typewriter effect for content
  // -----------------------------



async function typeContent(fullText: string, speed = 30) {
  if (!editor) return;

  const MAX_DURATION = 30_000; // 30 seconds in ms
  const minSpeed = 5; // lower bound so it doesn't get too fast

  // Dynamically calculate speed so typing finishes in <= 90s
  let dynamicSpeed = Math.floor(MAX_DURATION / fullText.length);
  if (dynamicSpeed > speed) dynamicSpeed = speed; // cap at default
  if (dynamicSpeed < minSpeed) dynamicSpeed = minSpeed; // avoid too fast

  editor.commands.clearContent(); // Clear previous content
  let current = "";

  for (let i = 0; i < fullText.length; i++) {
    current += fullText[i];
    editor.commands.setContent(current);
    await new Promise((resolve) => setTimeout(resolve, dynamicSpeed));
  }
}




  // async function typeContent(fullText: string, speed = 30) {
  //   if (!editor) return;
  //   editor.commands.clearContent(); // Clear previous content
  //   let current = "";

  //   for (let i = 0; i < fullText.length; i++) {
  //     current += fullText[i];
  //     editor.commands.setContent(current);
  //     await new Promise((resolve) => setTimeout(resolve, speed));
  //   }
  // }

  // -----------------------------
  // Initialize editor
  // -----------------------------
  onMount(() => {
    editor = new Editor({
      element,
      extensions: [
        StarterKit,                 // Basic formatting (paragraphs, bold, italic, etc.)
        Heading.configure({ levels: [1, 2, 3] }), // Headings
        Underline,                  // Underline extension
        Highlight,                  // Highlight extension
        CodeBlock                   // Code block extension
      ],
      content,
      onUpdate: updateActiveStyles, // Update active styles on content change
    });

    // -----------------------------
    // Bubble menu logic
    // -----------------------------
    let lastSelection: { from: number; to: number } = { from: 0, to: 0 };
    editor.on("selectionUpdate", ({ editor }) => {
      const { from, to } = editor.state.selection;

      // Show menu only if text is selected
      if (from !== to && (from !== lastSelection.from || to !== lastSelection.to)) {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const rect = domSelection.getRangeAt(0).getBoundingClientRect();
          menuX = rect.left + rect.width / 2; // Center horizontally
          menuY = rect.top - 10;              // Position slightly above selection
          showMenu = true;
        }
      } else if (from === to) {
        showMenu = false; // Hide menu if no selection
      }

      lastSelection = { from, to };
      updateActiveStyles();
    });

    // -----------------------------
    // Close menu when clicking outside
    // -----------------------------
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        element &&
        !element.contains(target) &&
        bubbleMenu &&
        !bubbleMenu.contains(target)
      ) {
        showMenu = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup on destroy
    onDestroy(() => {
      document.removeEventListener("mousedown", handleClickOutside);
      editor?.destroy();
    });
  });

  // -----------------------------
  // Watch for content changes to trigger typewriter
  // -----------------------------
  $: if (editor && content) {
    typeContent(content);
  }

  // -----------------------------
  // Handle heading dropdown
  // -----------------------------

  function setHeading(level: string) {
    const lvl = parseInt(level) as 0| 1 | 2 | 3;
    if (lvl === 0) {
      editor.chain().focus().setParagraph().run(); // Normal text
    } else {
      editor.chain().focus().toggleHeading({ level: lvl }).run();
    }
    currentHeading = level; // Update dropdown value
  }

  // Keep dropdown in sync with editor selection
  function updateHeadingState() {
    if (editor.isActive('heading', { level: 1 })) currentHeading = "1";
    else if (editor.isActive('heading', { level: 2 })) currentHeading = "2";
    else if (editor.isActive('heading', { level: 3 })) currentHeading = "3";
    else currentHeading = "0"; // Normal text
  }

  onMount(() => {
    editor.on('selectionUpdate', updateHeadingState);
    updateHeadingState(); // Initial sync
  });

</script>

<div class="editor-wrapper relative rounded-2xl">
  <!-- Custom Bubble Menu -->
  {#if showMenu}
    <div
      bind:this={bubbleMenu}
      class="bubble-menu dark:text-gray-900"
      style="position: fixed; top: {menuY}px; left: {menuX}px; transform: translate(-50%, -100%);"
    >
      <!-- Bold -->
      <button on:click={() => editor.chain().focus().toggleBold().run()} class:active={isBold} title="Bold">
        <Bold size={16} />
      </button>

      <!-- Italic -->
      <button on:click={() => editor.chain().focus().toggleItalic().run()} class:active={isItalic} title="Italic">
        <Italic size={16} />
      </button>

      <!-- Underline -->
      <button on:click={() => editor.chain().focus().toggleUnderline().run()} class:active={isUnderline} title="Underline">
        <UnderlineIcon size={16} />

      </button>

      <!-- Highlight -->
      <button on:click={() => editor.chain().focus().toggleHighlight().run()} class:active={isHighlight} title="Highlight">
        <Highlighter size={16} />
      </button>

      <!-- Code Block -->
      <button on:click={() => editor.chain().focus().toggleCodeBlock().run()} class:active={isCode} title="Code Block">
        <Code size={16} />
      </button>

      <!-- Heading Dropdown -->
    <select
  class="heading-dropdown font-semibold text-xl"
  bind:value={currentHeading}
  on:change={(e:any) => setHeading(e.target.value)}
>
  <option value="0" class="font-semibold text-[12px]">P
</option>
  <option value="1" class="font-semibold text-[16px]">h1</option>
  <option value="2" class="font-semibold text-[14px]">h2</option>
  <option value="3" class="font-semibold text-[12px]">h3</option>
</select>

    </div>
  {/if}

  <!-- Editor Container -->
  <div bind:this={element} class="editor"></div>
</div>

<style>
  .editor-wrapper { position: relative; max-width: 700px; }
  .editor { border: none; padding: 1rem; outline: none; min-height: 200px; }

  /* Bubble menu styling (compact icon size) */
  .bubble-menu {
    display: flex; gap: 4px;
    background: #e9ebf1; border-radius: 24px;
    padding: 4px; font-size: 12px;
    pointer-events: auto; box-shadow: 0 2px 8px rgba(16, 118, 182, 0.3);
    z-index: 9999;
  }

  .bubble-menu button {
    background: transparent; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    padding: 2px; border-radius: 4px;
    transition: background 0.2s;
  }
  .bubble-menu button:hover { background: rgba(0,0,0,0.05); }
  .bubble-menu button.active { background: white; color: black; }

  .heading-dropdown {
    font-size: 12px; padding: 2px 4px; border-radius: 4px;
    border: 1px solid #ccc; background: white; cursor: pointer;
  }

  :global(.ProseMirror) { width: 100%; border: none; min-height: 200px; outline: none; }
</style>
