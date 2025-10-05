<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";

  /**
   * Bio Form Action Buttons Component
   * Contains Reset and Generate buttons
   */

  // Props
  export let loadingAI: boolean;
  export let handleReset: () => void;
</script>

<Card.Footer class="flex flex-row gap-4 mt-4 px-0">
  <Button
    type="button"
    onclick={handleReset}
    class="flex-1 py-6 font-semibold text-lg dark:text-gray-300 bg-gradient-to-br from-blue-400 via-75% to-teal-500 dark:from-blue-700 dark:via-75% dark:to-teal-900"
  >
    Reset
  </Button>
  <Button
    type="submit"
    disabled={loadingAI}
    class="flex-1 py-6 font-semibold text-lg dark:text-gray-300 bg-gradient-to-br from-red-400 via-35% to-blue-500 dark:from-red-700 dark:via-35% dark:to-blue-800"
  >
    {loadingAI ? "Generating" : "Generate"}
  </Button>
</Card.Footer>
