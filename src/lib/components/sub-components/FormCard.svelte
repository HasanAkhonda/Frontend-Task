<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import ThemeToggle from "./ThemeToggle.svelte";
  import BioForm from "./BioForm.svelte";

  /**
   * Form Card Component
   * Contains the bio generation form with theme toggle
   */

  // Form field bindings
  export let fullname: string;
  export let title: string;
  export let company: string;
  export let tags: string;
  export let tone: string;
  export let goal: string;

  // State props
  export let showSecondCard: boolean;
  export let loadingAI: boolean;

  // Event handlers
  export let handleSubmit: (e: Event) => void;
  export let handleReset: () => void;
  export let toggleMode: () => void;
</script>

<!-- Form Card Container -->
<Card.Root
  class={`w-full max-w-lg flex flex-col px-8 py-8 transition-all duration-1000 shadow-xl rounded-2xl h-full md:h-[520px] bg-white/15 dark:bg-gray-900 ${showSecondCard ? "md:translate-x-[0%]" : "md:translate-x-[53%]"}`}
>
  <!-- Header with Title and Theme Toggle -->
  <div class="relative w-full flex justify-center items-center mb-6">
    <h1
      class="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
    >
      MagicMind
    </h1>
    <div class="absolute -right-6 -top-6">
      <ThemeToggle {toggleMode} />
    </div>
  </div>

  <!-- Form Content -->
  <Card.Content class="flex-1 overflow-auto px-0">
    <BioForm
      bind:fullname
      bind:title
      bind:company
      bind:tags
      bind:tone
      bind:goal
      {loadingAI}
      {handleSubmit}
      {handleReset}
    />
  </Card.Content>
</Card.Root>
