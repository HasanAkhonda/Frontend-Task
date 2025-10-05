<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  /**
   * Reusable Form Field Component
   * Combines Label + Input with consistent styling
   */

  export let id: string; // unique input id
  export let label: string; // label text
  export let placeholder: string; // input placeholder
  export let value: string; // bound input value
  export let required: boolean = false; // whether field is required
  export let type: string = "text"; // input type (text, email, etc.)
</script>

<!-- Wrapper -->
<div class="flex flex-col gap-2">
  <!-- Label -->
  <Label for={id} class="text-gray-500 dark:text-gray-300 text-md">
    {label}
  </Label>

  <!-- Input -->
  <Input
    {id}
    {type}
    {placeholder}
    {required}
    bind:value
    class="py-5.5 text-md"
  />
</div>
