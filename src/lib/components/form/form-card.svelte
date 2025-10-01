<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import BioGeneratorLayout from "../reusables/BioGeneratorLayout.svelte";
  import FormCard from "../reusables/FormCard.svelte";
  import EditorCard from "../reusables/EditorCard.svelte";
  import { generateBio } from "$lib/services/bioService";
  import type { BioFormData } from "$lib/types/bio";

  // -----------------------------
  // Local state
  // -----------------------------
  let editorContent = "";
  let showSecondCard = false;
  let loadingAI = false;

  // Form data variables
  let fullname = "";
  let title = "";
  let company = "";
  let tags = "";
  let tone = "";
  let goal = "";

  let submittedData: BioFormData | null = null;
  let controller: AbortController | null = null;

  // -----------------------------
  // Form submit handler
  // -----------------------------
  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (loadingAI) return; // prevent multiple clicks while loading

    controller = new AbortController();
    submittedData = { fullname, title, company, tags, tone, goal };
    console.log("Form Data:", submittedData);
    showSecondCard = true;
    loadingAI = true; // show loader immediately

    try {
      // Call the bio generation service
      editorContent = await generateBio(submittedData, controller.signal);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted by reset.");
      } else {
        console.error("Error fetching AI response:", err);
        editorContent = "Error fetching AI response";
      }
    } finally {
      loadingAI = false;
    }
  }

  // -----------------------------
  // Reset form
  // -----------------------------
  function handleReset() {
    if (controller) {
      controller.abort(); // cancel fetch if running
    }
    fullname = "";
    title = "";
    company = "";
    tags = "";
    tone = "";
    goal = "";
    editorContent = "";
    showSecondCard = false;
    loadingAI = false; // hide loader after content is ready
  }
</script>

<!-- Main Layout Wrapper -->
<BioGeneratorLayout {showSecondCard}>
  <!-- Form Card Slot -->
  <FormCard
    slot="form"
    bind:fullname
    bind:title
    bind:company
    bind:tags
    bind:tone
    bind:goal
    {showSecondCard}
    {loadingAI}
    {handleSubmit}
    {handleReset}
    {toggleMode}
  />

  <!-- Editor Card Slot -->
  <EditorCard
    slot="editor"
    {showSecondCard}
    {loadingAI}
    {editorContent}
  />
</BioGeneratorLayout>