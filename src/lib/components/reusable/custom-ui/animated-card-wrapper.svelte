<script lang="ts">
  import { fly } from "svelte/transition";

  // ✅ Props with default values
  let {
    show = false, // condition to control visibility
    customClasses = "", // optional extra classes
  } = $props();
</script>

<!-- ==========================
     Animated Card Wrapper
========================== -->
<div
  in:fly={{ x: 400, duration: 800 }}
  out:fly={{ x: 400, duration: 800 }}
  class={`w-full max-w-lg transition-all mt-6 md:mt-0 duration-1000 ${
    !show
      ? "md:translate-x-[53%] md:opacity-0 hidden md:block"
      : "md:translate-x-[0%] opacity-100 block"
  } ${customClasses}`}
>
  <slot />
</div>
