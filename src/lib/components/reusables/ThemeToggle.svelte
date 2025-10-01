<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import SunIcon from "@lucide/svelte/icons/sun";
  import MoonIcon from "@lucide/svelte/icons/moon";

  /**
   * Theme Toggle Component
   * Switches between light and dark mode
   */

  export let toggleMode: () => void;
</script>

<Button onclick={toggleMode} variant="ghost" size="icon">
  <SunIcon
    class="h-[1rem] w-[1rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
  />
  <MoonIcon
    class="absolute h-[1rem] w-[1rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
  />
  <span class="sr-only">Toggle theme</span>
</Button>