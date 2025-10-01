<!-- src/lib/components/BioGenerator/EditorCard.svelte -->
<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { fly } from "svelte/transition";
  import TiptapEditor from "$lib/components/editor/TiptapEditor.svelte";
  import Loader from "./Loader.svelte";

  /**
   * Editor Card Component
   * Displays the AI-generated bio content or loading state
   */

  export let showSecondCard: boolean;
  export let loadingAI: boolean;
  export let editorContent: string;
</script>

<!-- Editor Card Container with animations -->
<div
  in:fly={{ x: 400, duration: 800 }}
  out:fly={{ x: 400, duration: 800 }}
  class={`w-full max-w-lg transition-all mt-6 md:mt-0 duration-1000 ${!showSecondCard ? "md:translate-x-[53%] md:opacity-0 hidden md:block" : "md:translate-x-[0%] opacity-100 block"}`}
>
  <Card.Root
    class="flex-col p-2 shadow-xl rounded-2xl h-full max-h-[520px] md:h-[520px] bg-white/15 dark:bg-gray-900"
  >
    <Card.Content
      class="bg-white/40 dark:bg-white/5 rounded-2xl p-0 flex-1 w-full max-w-2xl editor-wrapper overflow-y-scroll hide-scrollbar"
    >
      {#if loadingAI}
        <!-- Loading State -->
        <Loader />
      {:else}
        <!-- AI-generated content -->
        <TiptapEditor content={editorContent} />
      {/if}
    </Card.Content>
  </Card.Root>
</div>

<style>
  /* ProseMirror editor styling */
  :global(.ProseMirror) {
    width: -webkit-fill-available;
    position: relative;
    border: none;
    padding: 0;
    outline: none;
  }
</style>