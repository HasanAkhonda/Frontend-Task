<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import FormField from "./FormField.svelte";

  /**
   * Bio Form Component
   * Contains all form fields and submit/reset buttons
   */

  // Form field bindings
  export let fullname: string;
  export let title: string;
  export let company: string;
  export let tags: string;
  export let tone: string;
  export let goal: string;

  // State props
  export let loadingAI: boolean;

  // Event handlers
  export let handleSubmit: (e: Event) => void;
  export let handleReset: () => void;
</script>

<form class="flex flex-col gap-4" on:submit={handleSubmit}>
  <!-- Grid: Full Name & Title -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    <FormField
      id="fullname"
      label="Full Name"
      placeholder="John Doe"
      bind:value={fullname}
      required
    />
    <FormField
      id="title"
      label="Title"
      placeholder="Frontend Engineer"
      bind:value={title}
      required
    />
  </div>

  <!-- Grid: Company & Tags -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    <FormField
      id="company"
      label="Company"
      placeholder="MagicMind Inc."
      bind:value={company}
      required
    />
    <FormField
      id="tags"
      label="Tags"
      placeholder="Frontend, UI/UX, React"
      bind:value={tags}
      required
    />
  </div>

  <!-- Grid: Tone & Goal -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    <FormField
      id="tone"
      label="Tone"
      placeholder="Professional and approachable"
      bind:value={tone}
      required
    />
    <FormField
      id="goal"
      label="Goal"
      placeholder="Create a detailed professional bio"
      bind:value={goal}
      required
    />
  </div>

  <!-- Action Buttons -->
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
</form>