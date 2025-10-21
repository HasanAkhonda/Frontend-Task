<!-- src/lib/components/forms/BioForm.svelte -->
<script lang="ts">
  import CustomLabeledInput from "$lib/components/reusable/custom-ui/custom-labeled-input.svelte";
  import FormInputWrapper from "$lib/components/reusable/wrappers/form-input-wrapper.svelte";
  import CustomButton from "$lib/components/reusable/custom-ui/custom-button.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  // Props types
  type Props = {
    loadingAI?: boolean;
    fullname?: string;
    title?: string;
    company?: string;
    tags?: string;
    tone?: string;
    goal?: string;
    handleSubmit: (e: Event) => void;
    handleReset: () => void;
  };
  // Declare props 
  let {
    loadingAI = false,
    fullname = $bindable(""),
    title = $bindable(""),
    company = $bindable(""),
    tags = $bindable(""),
    tone = $bindable(""),
    goal = $bindable(""),
    handleSubmit,
    handleReset,
  }: Props = $props();
  
</script>

<Card.Content class="flex-1 px-0">
  <form class="flex flex-col gap-4" onsubmit={handleSubmit}>
    <!-- Grid: Full Name & Title -->
    <FormInputWrapper>
      <CustomLabeledInput
        label="Full Name"
        id="fullname"
        type="text"
        placeholder="John Doe"
        required
        bind:value={fullname}
      />
      <CustomLabeledInput
        label="Title"
        id="title"
        type="text"
        placeholder="Frontend Engineer"
        required
        bind:value={title}
      />
    </FormInputWrapper>

    <!-- Grid: Company & Tags -->
    <FormInputWrapper>
      <CustomLabeledInput
        label="Company"
        id="company"
        type="text"
        placeholder="MagicMind Inc."
        required
        bind:value={company}
      />
      <CustomLabeledInput
        label="Tags"
        id="tags"
        type="text"
        placeholder="Frontend, UI/UX, React"
        required
        bind:value={tags}
      />
    </FormInputWrapper>

    <!-- Grid: Tone & Goal -->
    <FormInputWrapper>
      <CustomLabeledInput
        label="Tone"
        id="tone"
        type="text"
        placeholder="Professional and approachable"
        required
        bind:value={tone}
      />
      <CustomLabeledInput
        label="Goal"
        id="goal"
        type="text"
        placeholder="Create a detailed professional bio"
        required
        bind:value={goal}
      />
    </FormInputWrapper>

    <!-- Buttons -->
    <Card.Footer class="flex flex-row gap-4 mt-4 px-0">
      <CustomButton
        Onclicked={handleReset}
        buttonSize="icon"
        buttonStyle="flex-1 py-6 font-semibold text-lg dark:text-gray-300 bg-gradient-to-br from-blue-400 via-75% to-teal-500 dark:from-blue-700 dark:via-75% dark:to-teal-900"
        customVarient="ghost"
        buttonTitle="Reset"
      />
      <CustomButton
        buttonType="submit"
        buttonSize="icon"
        buttonStyle="flex-1 py-6 font-semibold text-lg dark:text-gray-300 bg-gradient-to-br from-red-400 via-35% to-blue-500 dark:from-red-700 dark:via-35% dark:to-blue-800"
        customVarient="ghost"
        disabled={loadingAI}
        >{loadingAI ? "Generating" : "Generate"}</CustomButton
      >
    </Card.Footer>
  </form>
</Card.Content>
