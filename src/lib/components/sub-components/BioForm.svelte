<script lang="ts">
  import FormField from "./FormField.svelte";
  import BioFormButtons from "./BioFormButtons.svelte";

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
  <BioFormButtons {loadingAI} {handleReset} />
</form>
