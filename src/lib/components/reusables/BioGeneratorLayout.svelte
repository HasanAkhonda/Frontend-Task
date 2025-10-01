<script lang="ts">
  /**
   * Layout wrapper component for the Bio Generator
   * Handles the main container styling and responsive layout
   */
  export let showSecondCard: boolean;
</script>

<!-- Main layout container with gradient background -->
<div
  class="flex flex-col bg-gradient-to-tr from-red-400/50 via-35% to-blue-500/50 dark:bg-[url('https://images.unsplash.com/photo-1610505466122-b1d9482901ef?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0')] bg-cover bg-center bg-no-repeat w-full md:overflow-hidden h-full md:h-screen md:flex-row justify-center items-center md:gap-5 lg:gap-10 px-4 md:px-0 py-6 md:py-15"
>
  <!-- Form Card Slot -->
  <slot name="form" />

  <!-- Editor Card Slot -->
  <slot name="editor" />
</div>