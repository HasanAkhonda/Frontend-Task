<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  let { cardStyle = "" }: { cardStyle?: string } = $props();
</script>

<div
  class={`${cardStyle}`}
>
  <Card.Root
    class="flex flex-col  h-full  min-h-[520px] md:h-[520px] px-8 py-8 shadow-xl rounded-2xl bg-white/15 dark:bg-gray-900"
  >
    <slot />
  </Card.Root>
</div>
