<script lang="ts">
  // ============================================
  // IMPORTS
  // ============================================

  // Lucide icons for UI elements
  import { X, Check, Loader2 } from "lucide-svelte"; // cross, tick, spinner

  // Svelte lifecycle hooks
  import { onMount, onDestroy } from "svelte";

  // TipTap editor core and extensions
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Heading from "@tiptap/extension-heading";
  import Underline from "@tiptap/extension-underline";
  import Highlight from "@tiptap/extension-highlight";
  import CodeBlock from "@tiptap/extension-code-block";
  import { Textarea } from "$lib/components/ui/textarea/index.js";

  // Additional Lucide icons for toolbar
  import {
    Bold,
    Italic,
    Code,
    Highlighter,
    UnderlineIcon,
    Sparkles,
    HourglassIcon,
  } from "lucide-svelte";

  // ============================================
  // COMPONENT PROPS
  // ============================================

  export let content: string = " "; // Initial content for the editor

  // ============================================
  // DOM ELEMENT REFERENCES
  // ============================================

  let element: HTMLDivElement; // Main editor container
  let bubbleMenu: HTMLElement; // Bubble menu (formatting toolbar)
  let editor: Editor; // TipTap editor instance
  let regenerateContainer: HTMLElement; // Container for regenerate prompt input

  // ============================================
  // EDITOR STATE VARIABLES
  // ============================================

  // Active formatting states
  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let isHighlight = false;
  let isCode = false;
  let currentHeading: string = "0"; // "0" = paragraph, "1"/"2"/"3" = heading levels

  // ============================================
  // BUBBLE MENU STATE
  // ============================================

  let showMenu = false; // Whether bubble menu is visible
  let menuX = 0; // X position of bubble menu
  let menuY = 0; // Y position of bubble menu

  // ============================================
  // AI REGENERATION STATE
  // ============================================

  let regenerating = false; // Whether AI is currently regenerating text
  let showPromptInput = false; // Whether prompt input is visible
  let userPrompt = ""; // User's regeneration instruction
  let abortController: AbortController | null = null; // For cancelling AI requests

  // ============================================
  // UPDATE ACTIVE FORMATTING STYLES
  // ============================================

  /**
   * Updates the active state of all formatting buttons
   * based on current cursor position/selection
   */
  function updateActiveStyles() {
    if (!editor) return;

    // Check which formatting is active at cursor
    isBold = editor.isActive("bold");
    isItalic = editor.isActive("italic");
    isUnderline = editor.isActive("underline");
    isHighlight = editor.isActive("highlight");
    isCode = editor.isActive("codeBlock");

    // Check current heading level
    if (editor.isActive("heading", { level: 1 })) currentHeading = "1";
    else if (editor.isActive("heading", { level: 2 })) currentHeading = "2";
    else if (editor.isActive("heading", { level: 3 })) currentHeading = "3";
    else currentHeading = "0";
  }

  // ============================================
  // EDITOR INITIALIZATION
  // ============================================

  onMount(() => {
    // Initialize TipTap editor
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

    // Track last selection for reference
    let lastSelection: { from: number; to: number } = { from: 0, to: 0 };

    // Listen to selection changes
    editor.on("selectionUpdate", ({ editor }) => {
      const { from, to } = editor.state.selection;

      // Always refresh active styles (even if caret only)
      updateActiveStyles();

      // If text is selected (not just cursor)
      if (from !== to) {
        // highlightSelectionOnly(); // commented for removing last selected highlights

        // Wait for the next frame to get proper selection rect
        requestAnimationFrame(() => {
          updateBubbleMenuPosition();
        });
      } else {
        // Hide menu if no selection
        showMenu = false;
      }

      // Update styles on any transaction
      editor.on("transaction", () => {
        updateActiveStyles();
      });
    });

    // ============================================
    // EVENT LISTENERS
    // ============================================

    /**
     * Hide bubble menu when clicking outside editor or menu
     */
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Hide bubble menu if clicked outside
      if (
        element &&
        !element.contains(target) &&
        bubbleMenu &&
        !bubbleMenu.contains(target)
      ) {
        showMenu = false;
      }

      // Hide regenerate prompt if clicked outside
      if (regenerateContainer && !regenerateContainer.contains(target)) {
        showPromptInput = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    /**
     * Update bubble menu position on scroll or resize
     */
    const handleScrollOrResize = () => {
      if (showMenu) updateBubbleMenuPosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    // ============================================
    // CLEANUP ON DESTROY
    // ============================================

    onDestroy(() => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);

      editor?.destroy();
    });
  });

  // ============================================
  // HIGHLIGHT SELECTION ONLY (COMMENTED OUT)
  // ============================================

  /**
   * Highlights only the currently selected text
   * Removes all previous highlights first
   */
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

  // ============================================
  // BUBBLE MENU POSITIONING
  // ============================================

  /**
   * Calculates and updates the position of the bubble menu
   * based on the current text selection
   */
  function updateBubbleMenuPosition() {
    const domSelection = window.getSelection();
    if (domSelection && domSelection.rangeCount > 0 && element) {
      const range = domSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const wrapperRect = element.getBoundingClientRect(); // editor wrapper

      // Position relative to editor wrapper (horizontal center)
      menuX = rect.left - wrapperRect.left + rect.width / 2;

      const menuHeight = bubbleMenu?.offsetHeight || 40; // fallback if not rendered yet
      const offset = 10;

      // Default: place menu above selection
      let top = rect.top - wrapperRect.top - offset;

      // If not enough space above, place it below
      if (top - menuHeight < 0) {
        top = rect.bottom - wrapperRect.top + offset;
      }

      menuY = top;
      showMenu = true;
    } else {
      showMenu = false;
    }
  }

  // ============================================
  // HEADING LEVEL CONTROL
  // ============================================

  /**
   * Sets the heading level for the current selection
   * @param level - "0" for paragraph, "1"/"2"/"3" for heading levels
   */
  function setHeading(level: string) {
    const lvl = parseInt(level) as 0 | 1 | 2 | 3;
    if (lvl === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: lvl }).run();
    currentHeading = level;
  }

  /**
   * Updates the current heading state based on cursor position
   */
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

  // ============================================
  // AI TEXT REGENERATION
  // ============================================

  /**
   * Regenerates the selected text using AI based on user prompt
   * Uses Cohere API to rewrite the text
   */
  async function regenerateSelection() {
    if (!editor) return;

    // Get the selected text
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
      // Call Cohere API
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

  /**
   * Cancels the current AI regeneration request
   */
  function cancelRegeneration() {
    if (abortController) {
      abortController.abort();
    }
  }

  // ============================================
  // TYPEWRITER EFFECTS
  // ============================================

  /**
   * Types out content with typewriter effect for main AI response
   * @param fullText - The complete text to type out
   * @param speed - Base speed in milliseconds per character
   */
  async function typeContent(fullText: string, speed = 60) {
    if (!editor) return;

    const MAX_DURATION = 15_000; // 15 seconds in ms
    const minSpeed = 5; // lower bound so it doesn't get too fast

    // Dynamically calculate speed so typing finishes in <= 15s
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

  // ============================================
  // REACTIVE STATEMENT - TYPEWRITER FOR MAIN CONTENT
  // ============================================

  // Commenting to stop main typewriter animation
  $: if (editor && content) {
    typeContent(content);
  }

  /**
   * Typewriter effect for regenerated text with highlight
   * @param text - The text to insert
   * @param speed - Base speed in milliseconds per character
   */
  async function typewriterInsert(text: string, speed = 60) {
    const { from, to } = editor.state.selection; // capture selection range
    let pos = from;

    // First, clear old selection
    editor.chain().focus().deleteRange({ from, to }).run();

    const MAX_DURATION = 30_000; // 30 seconds in ms
    const minSpeed = 7; // lower bound so it doesn't get too fast

    // Calculate speed so typing finishes within MAX_DURATION
    let dynamicSpeed = Math.floor(MAX_DURATION / text.length);
    if (dynamicSpeed < speed) dynamicSpeed = speed; // cap at default speed
    if (dynamicSpeed > minSpeed) dynamicSpeed = minSpeed; // ensure minimum

    // Typewriter effect - insert character by character
    for (let i = 0; i < text.length; i++) {
      editor
        .chain()
        .focus()
        .insertContentAt({ from: pos + i, to: pos + i }, text[i])
        .run();

      await new Promise((r) => setTimeout(r, dynamicSpeed));
    }

    const newTo = pos + text.length;

    // Reselect the newly inserted text + highlight
    editor
      .chain()
      .setTextSelection({ from: pos, to: newTo })
      .setMark("highlight", { color: "" })
      .run();
  }
</script>

<!-- ============================================ -->
<!-- TEMPLATE / MARKUP -->
<!-- ============================================ -->

<!-- Main editor wrapper -->
<div
  class="editor-wrapper relative rounded-2xl overflow-y-scroll hide-scrollbar h-[504px]"
>
  <!-- ============================================ -->
  <!-- BUBBLE MENU (FORMATTING TOOLBAR) -->
  <!-- ============================================ -->

  {#if showMenu}
    <div
      bind:this={bubbleMenu}
      class="bubble-menu dark:text-gray-900 z-11"
      style="top: {menuY}px; left: {menuX}px; transform: translate(-50%, -100%);"
    >
      <!-- Bold Button -->
      <button
        on:click={() => editor.chain().focus().toggleBold().run()}
        class:active={isBold}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <!-- Italic Button -->
      <button
        on:click={() => editor.chain().focus().toggleItalic().run()}
        class:active={isItalic}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <!-- Underline Button -->
      <button
        on:click={() => editor.chain().focus().toggleUnderline().run()}
        class:active={isUnderline}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>

      <!-- Highlight Button -->
      <button
        on:click={() => editor.chain().focus().toggleHighlight().run()}
        class:active={isHighlight}
        title="Highlight"
      >
        <Highlighter size={16} />
      </button>

      <!-- Code Block Button -->
      <button
        on:click={() => editor.chain().focus().toggleCodeBlock().run()}
        class:active={isCode}
        title="Code Block"
      >
        <Code size={16} />
      </button>

      <!-- Heading Level Dropdown -->
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

      <!-- ============================================ -->
      <!-- AI REGENERATE BUTTON & PROMPT INPUT -->
      <!-- ============================================ -->

      <div class="relative" bind:this={regenerateContainer}>
        <!-- Regenerate/Sparkles Button -->
        <button
          on:click={() => (showPromptInput = !showPromptInput)}
          class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Regenerate"
        >
          {#if regenerating}
            <!-- Loading spinner while regenerating -->
            <HourglassIcon
              size={18}
              class=" border-1 border-gray-800 p-0.5 rounded-full spin"
              style="animation: spin 1s linear infinite;"
            />
          {:else}
            <!-- Sparkles icon when idle -->
            <Sparkles size={18} />
          {/if}
        </button>

        <!-- Prompt Input Popup -->
        {#if showPromptInput}
          <div
            class="absolute top-full -right-1 mt-2 w-49 bg-[#e9ebf1] rounded-md shadow-2xl px-1 py-1 border border-gray-200 dark:border-gray-700 z-[9999] transition-all duration-200"
          >
            <!-- Text Input for user instruction -->
            <Textarea
              placeholder="e.g. Make it formal"
              bind:value={userPrompt}
              class="w-full rounded-md px-3 py-2 text-sm bg-[#e9ebf1] text-gray-800 dark:text-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-400 focus:outline-none transition"
            />

            <!-- Action Buttons (Cancel & Confirm) -->
            <div class="flex justify-between mt-2 gap-2">
              <!-- Cancel Button -->
              <button
                on:click={() => (
                  (showPromptInput = false), cancelRegeneration()
                )}
                class="flex-1 flex items-center justify-center
           text-xs px-2 py-1.5 rounded-md
           border border-gray-300 dark:border-gray-600
            dark:text-gray-300
           hover:bg-gray-100 dark:hover:bg-gray-800
           transition"
                title="Cancel"
              >
                <!-- Red/soft danger tone -->
                <X size={12} class="text-red-500 dark:text-red-400" />
              </button>

              <!-- Confirm/Generate Button -->
              <button
                on:click={regenerateSelection}
                disabled={regenerating}
                class={`flex-1 flex items-center justify-center 
            text-xs px-2 py-1.5 rounded-md font-medium shadow-sm transition
            ${
              regenerating
                ? "bg-indigo-500 text-white opacity-80 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-400 to-green-400 text-white hover:from-indigo-500 hover:to-green-500"
            }`}
                title="Regenerate"
              >
                {#if regenerating}
                  <!-- Spinner in themed indigo -->
                  <Loader2
                    class="animate-spin border-border-slate-200 shadow-xl text-green-500"
                    size={12}
                  />
                {:else}
                  <!-- Green check icon when ready -->
                  <Check
                    size={12}
                    class="border-border-slate-200 shadow-xl text-green-500"
                  />
                {/if}
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- ============================================ -->
  <!-- TIPTAP EDITOR ELEMENT -->
  <!-- ============================================ -->

  <div bind:this={element} class="editor z-10"></div>
</div>

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Heading dropdown styling */
  .heading-dropdown {
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
  }

  /* ProseMirror editor base styles */
  :global(.ProseMirror) {
    width: 100%;
    border: none;
    min-height: 200px;
    outline: none;
  }
</style>
