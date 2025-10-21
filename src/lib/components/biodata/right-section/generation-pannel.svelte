<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import CustomLoader from "$lib/components/reusable/custom-ui/custom-loader.svelte";
  import TiptapEditor from "./editor/TiptapEditor.svelte";

  // ✅ Define typed props
  type Props = {
    loadingAI?: boolean;
    editorContent?: string;
  };

  // ✅ Destructure typed props
  let { loadingAI = false, editorContent = "" }: Props = $props();
</script>

<Card.Root
  class="flex-col p-2 shadow-xl rounded-2xl h-full max-h-[520px] md:h-[520px] bg-white/15 dark:bg-gray-900"
>
  <Card.Content
    class="bg-white/40 dark:bg-white/5 rounded-2xl p-0 flex-1 w-full max-w-2xl editor-wrapper"
  >
    {#if loadingAI}
      <div class="flex justify-center items-center h-[504px]">
        <CustomLoader />
      </div>
    {:else}
      <TiptapEditor content={editorContent} />
    {/if}
  </Card.Content>
</Card.Root>
