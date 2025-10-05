<script lang="ts">
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
    X,
    Check,
    Loader2,
  } from "lucide-svelte";

  // ======================================
  // Props & local refs
  // ======================================
  export let content: string = "";
  let element: HTMLDivElement;
  let bubbleMenu: HTMLElement;
  let regenerateContainer: HTMLElement;
  let editor: Editor;

  // ======================================
  // Editor state variables
  // ======================================
  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let isHighlight = false;
  let isCode = false;
  let currentHeading: string = "0";

  // Menu state
  let showMenu = false;
  let menuX = 0;
  let menuY = 0;

  // AI regenerate state
  let regenerating = false;
  let showPromptInput = false;
  let userPrompt = "";
  let abortController: AbortController | null = null;

  // ======================================
  // Utility: Update active text styles
  // ======================================
  function updateActiveStyles() {
    if (!editor) return;
    isBold = editor.isActive("bold");
    isItalic = editor.isActive("italic");
    isUnderline = editor.isActive("underline");
    isHighlight = editor.isActive("highlight");
    isCode = editor.isActive("codeBlock");

    if (editor.isActive("heading", { level: 1 })) currentHeading = "1";
    else if (editor.isActive("heading", { level: 2 })) currentHeading = "2";
    else if (editor.isActive("heading", { level: 3 })) currentHeading = "3";
    else currentHeading = "0";
  }

  // ======================================
  // Mount editor
  // ======================================
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

    // Handle selection updates
    editor.on("selectionUpdate", ({ editor }) => {
      const { from, to } = editor.state.selection;
      updateActiveStyles();

      if (from !== to) {
        highlightSelectionOnly();
        requestAnimationFrame(updateBubbleMenuPosition);
      } else {
        showMenu = false;
      }
    });

    // Handle transactions (e.g., bold/italic toggles)
    editor.on("transaction", updateActiveStyles);

    // Handle clicks outside editor or menu
    document.addEventListener("mousedown", handleClickOutside);

    // Handle scroll/resize to reposition menu
    const handleScrollOrResize = () => showMenu && updateBubbleMenuPosition();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    // Cleanup
    onDestroy(() => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      editor?.destroy();
    });
  });

  // ======================================
  // Highlight logic
  // ======================================
  function highlightSelectionOnly() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;

    // Remove previous highlights
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        tr.doc.descendants((node, pos) => {
          if (node.marks.some((m) => m.type.name === "highlight")) {
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

    // Add new highlight
    editor.chain().focus().setMark("highlight", { color: "" }).run();
  }

  // ======================================
  // Bubble Menu positioning
  // ======================================
  function updateBubbleMenuPosition() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && element) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const wrapperRect = element.getBoundingClientRect();

      menuX = rect.left - wrapperRect.left + rect.width / 2;
      const menuHeight = bubbleMenu?.offsetHeight || 40;
      const offset = 10;

      let top = rect.top - wrapperRect.top - offset;
      if (top - menuHeight < 0) top = rect.bottom - wrapperRect.top + offset;

      menuY = top;
      showMenu = true;
    } else {
      showMenu = false;
    }
  }

  // ======================================
  // Handle outside clicks
  // ======================================
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Node;
    const clickedOutside =
      element &&
      !element.contains(target) &&
      bubbleMenu &&
      !bubbleMenu.contains(target);

    const clickedInsideEditor = element && element.contains(target);
    const isOnHighlight =
      target instanceof HTMLElement &&
      target.closest("mark[data-type='highlight']");

    if (clickedOutside) {
      showMenu = false;
      editor.chain().focus().unsetHighlight().run();
    } else if (clickedInsideEditor && !isOnHighlight) {
      editor.chain().focus().unsetHighlight().run();
    } else if (isOnHighlight) {
      editor
        .chain()
        .focus()
        .command(({ tr, state }) => {
          tr.doc.descendants((node, pos) => {
            if (node.marks.some((m) => m.type.name === "highlight")) {
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
    }

    if (regenerateContainer && !regenerateContainer.contains(target)) {
      showPromptInput = false;
    }
  }

  // ======================================
  // Heading toggle
  // ======================================
  function setHeading(level: string) {
    const lvl = parseInt(level) as 0 | 1 | 2 | 3;
    if (lvl === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: lvl }).run();
    currentHeading = level;
  }

  // ======================================
  // AI Regeneration Logic
  // ======================================
  async function regenerateSelection() {
    if (!editor) return;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    if (!selectedText.trim()) return;

    regenerating = true;
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
              content: `Rewrite this text per user instruction. 
Instruction: ${userPrompt}
Text: ${selectedText}`,
            },
          ],
        }),
        signal,
      });

      const result = await response.json();
      const regenerated = result?.message?.content?.[0]?.text ?? "";
      if (regenerated) {
        editor
          .chain()
          .focus()
          .insertContentAt(
            {
              from: editor.state.selection.from,
              to: editor.state.selection.to,
            },
            ""
          )
          .run();
        await typewriterInsert(regenerated, editor.state.selection.from);
      }
    } catch (err: any) {
      if (err.name === "AbortError") console.log("Regeneration aborted");
      else console.error("Error:", err);
    } finally {
      regenerating = false;
      showPromptInput = false;
      userPrompt = "";
      abortController = null;
    }
  }

  function cancelRegeneration() {
    abortController?.abort();
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

  // ======================================
  // Typewriter effect for AI response
  // ======================================
  async function typewriterInsert(text: string, fromPos: number, speed = 60) {
    const MAX_DURATION = 30_000;
    const minSpeed = 7;
    let dynamicSpeed = Math.floor(MAX_DURATION / text.length);
    if (dynamicSpeed < speed) dynamicSpeed = speed;
    if (dynamicSpeed > minSpeed) dynamicSpeed = minSpeed;

    for (let i = 0; i < text.length; i++) {
      editor
        .chain()
        .focus()
        .insertContentAt({ from: fromPos + i, to: fromPos + i }, text[i])
        .run();
      await new Promise((r) => setTimeout(r, dynamicSpeed));
    }

    const newTo = fromPos + text.length;
    editor
      .chain()
      .setTextSelection({ from: fromPos, to: newTo })
      .setMark("highlight", { color: "" })
      .run();
  }
</script>

<!-- ======================================
     Template
====================================== -->
<div
  class="editor-wrapper relative rounded-2xl overflow-y-scroll hide-scrollbar h-[504px]"
>
  {#if showMenu}
    <!-- ======================================
         Bubble Menu - Formatting Toolbar
    ====================================== -->
    <div
      bind:this={bubbleMenu}
      class="bubble-menu dark:text-gray-900 z-11"
      style="top: {menuY}px; left: {menuX}px; transform: translate(-50%, -100%);"
    >
      <!-- Formatting Buttons -->
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
      <!-- <button on:click={() => editor.chain().focus().toggleHighlight().run()} class:active={isHighlight} title="Highlight">
        <Highlighter size={16} />
      </button> -->
      <button
        on:click={() => editor.chain().focus().toggleCodeBlock().run()}
        class:active={isCode}
        title="Code Block"
      >
        <Code size={16} />
      </button>

      <!-- Heading Dropdown -->
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

      <!-- ======================================
           AI Regenerate Button with Prompt Input
      ====================================== -->
      <div class="relative" bind:this={regenerateContainer}>
        <button
          on:click={() => (showPromptInput = !showPromptInput)}
          class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Regenerate"
        >
          {#if regenerating}
            <HourglassIcon
              size={18}
              class="border-1 border-gray-800 p-0.5 rounded-full spin"
              style="animation: spin 1s linear infinite;"
            />
          {:else}
            <Sparkles size={18} />
          {/if}
        </button>

        <!-- ======================================
             AI Prompt Input Card (New Design)
        ====================================== -->
        {#if showPromptInput}
          <div
            class="absolute right-[-4px] top-8 z-10 w-44 rounded-lg border border-gray-200 bg-white shadow-2xl transition-all duration-300 ease-in-out dark:border-gray-300 dark:bg-[#f3f4f6] hide-scrollbar"
          >
            <div class="px-2.5 py-2">
              <!-- Prompt Input Textarea (compact) -->
              <!-- svelte-ignore a11y_autofocus -->
              <!-- svelte-ignore element_invalid_self_closing_tag -->
              <textarea
                id="ai-prompt"
                class="mt-0.5 w-full rounded-md border hide-scrollbar border-gray-300 bg-white p-1.5 text-[12px] leading-4 text-gray-900 shadow-sm transition-all duration-200 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-400 dark:bg-[#f3f4f6] dark:text-gray-800"
                placeholder="E.g., 'Summarize', 'Rephrase', 'Make formal'"
                bind:value={userPrompt}
                disabled={regenerating}
                autofocus
                rows="3"
              />

              <!-- Action Buttons (compact) -->
              <div class="mt-2 flex justify-end space-x-1.5">
                <!-- Cancel -->
                <button
                  type="button"
                  class="group rounded-full border border-transparent bg-red-50 p-1.5 transition-all duration-200 ease-in-out hover:border-red-200 hover:bg-red-100 focus:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                  on:click={() => {
                    showPromptInput = false;
                    userPrompt = "";
                    cancelRegeneration();
                  }}
                  disabled={regenerating}
                  title="Cancel"
                >
                  <X
                    size={16}
                    class="text-red-500 transition-colors duration-200 group-hover:text-red-600"
                  />
                </button>

                <!-- Apply -->
                <button
                  type="button"
                  class="group rounded-full border border-transparent bg-green-50 p-1.5 transition-all duration-200 ease-in-out hover:border-green-200 hover:bg-green-100 focus:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:cursor-not-allowed disabled:opacity-50"
                  on:click={regenerateSelection}
                  disabled={!userPrompt.trim() || regenerating}
                  title="Apply"
                >
                  {#if regenerating}
                    <div
                      class="inline-block h-4 w-4 animate-spin rounded-full border-[2px] border-current border-t-transparent text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status"
                      aria-label="loading"
                    >
                      <span class="sr-only">Loading...</span>
                    </div>
                  {:else}
                    <Check
                      size={16}
                      class="text-green-500 transition-colors duration-200 group-hover:text-green-600"
                    />
                  {/if}
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- ======================================
       TipTap Editor Element
  ====================================== -->
  <div bind:this={element} class="editor z-10"></div>
</div>

<style>
  /* Heading Dropdown Styles */
  .heading-dropdown {
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
  }

  /* ProseMirror Editor Styles */
  :global(.ProseMirror) {
    width: 100%;
    border: none;
    min-height: 200px;
    outline: none;
  }
</style>
