<script lang="ts">
  import { formatAIContent } from "$lib/utils/aiFormatter";
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Heading from "@tiptap/extension-heading";
  import Underline from "@tiptap/extension-underline";
  import Highlight from "@tiptap/extension-highlight";
  import CodeBlock from "@tiptap/extension-code-block";
  import {
    Bold,
    Italic,
    Code,
    Highlighter,
    UnderlineIcon,
    Sparkles,
    HourglassIcon,
  } from "lucide-svelte";

  let element: HTMLDivElement;
  let bubbleMenu: HTMLElement;
  let editor: Editor;

  export let content: string = " ";

  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let isHighlight = false;
  let isCode = false;
  let currentHeading: string | number = 0;

  let showMenu = false;
  let menuX = 0;
  let menuY = 0;

  let regenerating = false;
  let showPromptInput = false;
  let userPrompt = "";
  let regenerateContainer: HTMLElement;

  function updateActiveStyles() {
    if (!editor) return;
    isBold = editor.isActive("bold");
    isItalic = editor.isActive("italic");
    isUnderline = editor.isActive("underline");
    isHighlight = editor.isActive("highlight");
    isCode = editor.isActive("codeBlock");

    if (editor.isActive("heading", { level: 1 })) currentHeading = 1;
    else if (editor.isActive("heading", { level: 2 })) currentHeading = 2;
    else if (editor.isActive("heading", { level: 3 })) currentHeading = 3;
    else currentHeading = 0;
  }

  onMount(() => {
    editor = new Editor({
      element,
      extensions: [
        StarterKit,
        Heading.configure({ levels: [1, 2, 3] }),
        Underline,
        Highlight,
        CodeBlock,
      ],
      content,
      onUpdate: updateActiveStyles,
    });

    let lastSelection: { from: number; to: number } = { from: 0, to: 0 };
    editor.on("selectionUpdate", ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (
        from !== to &&
        (from !== lastSelection.from || to !== lastSelection.to)
      ) {
        highlightSelectionOnly();
        updateBubbleMenuPosition();

        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const rect = domSelection.getRangeAt(0).getBoundingClientRect();
          menuX = rect.left + rect.width / 2;
          menuY = rect.top - 10;
          showMenu = true;
        }
      } else if (from === to) {
        showMenu = false;
      }
      lastSelection = { from, to };
      updateActiveStyles();
    });

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
      if (regenerateContainer && !regenerateContainer.contains(target)) {
        showPromptInput = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleScrollOrResize = () => {
      if (showMenu) updateBubbleMenuPosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    onDestroy(() => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);

      editor?.destroy();
    });
  });
  // ======================================
  // for highlight last selected portion
  // ======================================
  function highlightSelectionOnly() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return; // nothing selected

    // Remove all previous highlights
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        tr.doc.descendants((node, pos) => {
          if (node.marks.some((mark) => mark.type.name === "highlight")) {
            tr.removeMark(
              pos,
              pos + node.nodeSize,
              state.schema.marks.highlight
            );
          }
        });
        return true;
      })
      .run();

    // Apply highlight to current selection
    editor.chain().focus().setMark("highlight", { color: "" }).run();
  }

  // ======================================
  // for calculating the positioning of bubble menu
  // ======================================
  function updateBubbleMenuPosition() {
    const domSelection = window.getSelection();
    if (domSelection && domSelection.rangeCount > 0) {
      const rect = domSelection.getRangeAt(0).getBoundingClientRect();

      menuX = rect.left + rect.width / 2 + window.scrollX;
      menuY = rect.top + window.scrollY - 10; // small offset above text
      showMenu = true;
    } else {
      showMenu = false;
    }
  }

  function setHeading(level: string) {
    const lvl = parseInt(level) as 0 | 1 | 2 | 3;
    if (lvl === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: lvl }).run();
    currentHeading = level;
  }

  function updateHeadingState() {
    if (editor.isActive("heading", { level: 1 })) currentHeading = "1";
    else if (editor.isActive("heading", { level: 2 })) currentHeading = "2";
    else if (editor.isActive("heading", { level: 3 })) currentHeading = "3";
    else currentHeading = "0";
  }

  // onMount(() => {
  //   editor.on("selectionUpdate", updateHeadingState);
  //   updateHeadingState();
  // });

  let abortController: AbortController | null = null;

  async function regenerateSelection() {
    if (!editor) return;

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    if (!selectedText.trim()) return;

    regenerating = true;

    // Create a new AbortController for this request
    abortController = new AbortController();
    const { signal } = abortController;

    try {
      const response = await fetch("https://api.cohere.com/v2/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer LFMqJFwwN3t5H8pzBk7n1EYAdyySC9nYcFuJN0cA",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stream: false,
          model: "command-a-03-2025",
          messages: [
            {
              role: "user",
              content: `You are an AI writing assistant. 
Rewrite the following text according to the instruction, 
but do not make it longer than 2 lines more than the original. 
Keep the meaning clear, concise, and natural. And most importantly keep the formatting intact. 

Instruction: ${userPrompt}
Text to rewrite:
${selectedText}`,
            },
          ],
        }),
        signal, // attach abort signal
      });

      const result = await response.json();
      const regenerated = result?.message?.content?.[0]?.text ?? "";

      if (regenerated) {
        // Clear old selection first
        editor
          .chain()
          .focus()
          .insertContentAt(
            {
              from: editor.state.selection.from,
              to: editor.state.selection.to,
            },
            "" // clear
          )
          .run();

        // Call typewriter effect
        await typewriterInsert(regenerated, editor.state.selection.from);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Regeneration aborted by user");
      } else {
        console.error("Error regenerating text:", err);
      }
    } finally {
      regenerating = false;
      showPromptInput = false;
      userPrompt = "";
      abortController = null;
    }
  }

  // Optional: Function to abort current generation
  function cancelRegeneration() {
    if (abortController) {
      abortController.abort();
    }
  }

  // old type writer for main Ai response
  async function typeContent(fullText: string, speed = 60) {
    if (!editor) return;

    const MAX_DURATION = 15_000; // 30 seconds in ms
    const minSpeed = 5; // lower bound so it doesn't get too fast

    // Dynamically calculate speed so typing finishes in <= 30s
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

  // commmenting to stop main typewriter aimation/////////////////////////////////////////////////////////////////////////////////////////////

  $: if (editor && content) {
      typeContent(content);
    }

  // helper: typewriter effect
  async function typewriterInsert(text: string, speed = 60) {
    const MAX_DURATION = 15_000; // 30 seconds in ms
    const minSpeed = 7; // lower bound so it doesn't get too fast

    // Dynamically calculate speed so typing finishes in <= 30s
    let dynamicSpeed = Math.floor(text.length / MAX_DURATION);
    if (dynamicSpeed > speed) dynamicSpeed = speed; // cap at default
    if (dynamicSpeed < minSpeed) dynamicSpeed = minSpeed; // avoid too slow
    for (let i = 0; i < text.length; i++) {
      editor
        .chain()
        .focus()
        .insertContentAt({ from: speed + i, to: speed + i }, text[i])
        .run();
      await new Promise((r) => setTimeout(r, dynamicSpeed));
    }
  }
</script>

<div class="editor-wrapper relative rounded-2xl overflow-hidden">
  {#if showMenu}
    <div
      bind:this={bubbleMenu}
      class="bubble-menu dark:text-gray-900 z-11"
      style= "position: fixed; top: {menuY}px; left: {menuX}px; transform: translate(-50%, -100%);"
    >
      <button
        on:click={() => editor.chain().focus().toggleBold().run()}
        class:active={isBold}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        on:click={() => editor.chain().focus().toggleItalic().run()}
        class:active={isItalic}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <button
        on:click={() => editor.chain().focus().toggleUnderline().run()}
        class:active={isUnderline}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>

      <!-- <button
        on:click={() => editor.chain().focus().toggleHighlight().run()}
        class:active={isHighlight}
        title="Highlight"
      >
        <Highlighter size={16} />
      </button> -->

      <button
        on:click={() => editor.chain().focus().toggleCodeBlock().run()}
        class:active={isCode}
        title="Code Block"
      >
        <Code size={16} />
      </button>

      <select
        class="heading-dropdown font-semibold text-xl"
        bind:value={currentHeading}
        on:change={(e: any) => setHeading(e.target.value)}
      >
        <option value="0">P</option>
        <option value="1">h1</option>
        <option value="2">h2</option>
        <option value="3">h3</option>
      </select>

      <div class="relative" bind:this={regenerateContainer}>
        <button
          on:click={() => (showPromptInput = !showPromptInput)}
          class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Regenerate"
        >
          {#if regenerating}
            <HourglassIcon
              size={18}
              class=" border-1 border-gray-800 p-0.5 rounded-full spin"
              style="animation: spin 1s linear infinite;"
            />
          {:else}
            <Sparkles size={18} />
          {/if}
        </button>

        {#if showPromptInput}
          <div
            class="absolute top-full -right-1 mt-2 w-42 bg-[#e9ebf1] shadow-2xl rounded-xl px-0.5 py-1 border border-gray-200 dark:border-gray-700 z-[9999] transition-all duration-200"
          >
            <!-- Input -->
            <input
              type="text"
              placeholder="e.g. Make it formal"
              bind:value={userPrompt}
              class="w-full rounded-xl px-3 py-2 text-sm bg-[#e9ebf1] text-gray-800 dark:text-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-400 focus:outline-none transition"
            />

            <!-- Buttons -->
            <div class="flex justify-end gap-2">
              <button
                class="text-xs px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                on:click={() => (
                  (showPromptInput = false), cancelRegeneration()
                )}
              >
                Cancel
              </button>
              <button
                class={`text-xs px-4 py-2 rounded-lg font-medium shadow-sm transition  ${regenerating ? "text-green-800 bg-indigo-600 hover:none" : "text-green-600 bg-indigo-400"}`}
                on:click={regenerateSelection}
              >
                {regenerating ? "Generating" : "Regenerate"}
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <div bind:this={element} class="editor z-10"></div>
</div>

<style>
  
  .heading-dropdown {
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
  }

  :global(.ProseMirror) {
    width: 100%;
    border: none;
    min-height: 200px;
    outline: none;
  }
</style>
