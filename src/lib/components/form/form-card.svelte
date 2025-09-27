<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { fly } from "svelte/transition";
  import TiptapEditor from "$lib/components/editor/TiptapEditor.svelte";
  import SunIcon from "@lucide/svelte/icons/sun";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import { toggleMode } from "mode-watcher";
  import { formatAIContent } from "$lib/utils/aiFormatter";
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

  type SubmittedData = {
    fullname: string;
    title: string;
    company: string;
    tags: string;
    tone: string;
    goal: string;
  };

  let submittedData: SubmittedData | null = null;

  // -----------------------------
  // Format AI response into HTML
  // -----------------------------
 

  // -----------------------------
  // Form submit handler
  // -----------------------------

  let controller: AbortController | null = null;

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (loadingAI) return; // prevent multiple clicks while loading

     controller = new AbortController();
    submittedData = { fullname, title, company, tags, tone, goal };
    console.log("Form Data:", submittedData);
    showSecondCard = true;
    loadingAI = true; // show loader immediately

    // Build AI prompt dynamically
    const prompt = `
You are a professional AI writing assistant.
Generate a detailed, human-like professional bio using the following user info.

Full Name: ${fullname}
Title: ${title}
Company: ${company}
Tags: ${tags}
Tone: ${tone}
Goal: ${goal}

Format:
- A clear and professional Title/Heading with the full name and role .
- Background & Expertise: A detailed overview of the person’s technical/professional skills, domain expertise, and areas of focus.
- Approach & Philosophy: Describe how they approach work, design, problem-solving, or teamwork.
- Collaboration & Values: Highlight soft skills, teamwork, and personality traits.
- Goals & Vision: Describe their aspirations, future focus, or professional mission.

Make it natural, inspiring, and easy to read. Avoid generic filler—write with clarity and personality.
`;

    try {
      const response = await fetch("https://api.cohere.com/v2/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer LFMqJFwwN3t5H8pzBk7n1EYAdyySC9nYcFuJN0cA",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stream: false,
          model: "command-a-03-2025",
          messages: [{ role: "user", content: prompt }],
        }),
          signal: controller.signal,
      });

      const result = await response.json();
      console.log("AI Response:", result);
      const aiText =
        result?.message?.content?.[0]?.text ?? "No AI text returned";

      editorContent = formatAIContent(aiText);
    }  catch (err:any) {
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

<!-- ===========================
     Layout Wrapper
=========================== -->
<div
  class="flex flex-col bg-gradient-to-tr from-red-400/50 via-35% to-blue-500/50 dark:bg-[url('https://images.unsplash.com/photo-1610505466122-b1d9482901ef?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0')] bg-cover bg-center bg-no-repeat w-full h-screen md:flex-row justify-center items-center gap-10 px-4 md:px-0 my-auto"
>
  <!-- ===========================
       First Card (Form)
  ============================ -->
  <Card.Root
    class="w-full max-w-lg flex flex-col px-8 py-8 shadow-xl rounded-2xl h-[520px] bg-white/15 dark:bg-gray-900"
  >
    <div class="relative w-full flex justify-center items-center mb-6">
      <h1
        class="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
      >
        MagicMind
      </h1>
      <div class="absolute -right-6 -top-6">
        <Button onclick={toggleMode} variant="ghost" size="icon">
          <SunIcon
            class="h-[1rem] w-[1rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
          />
          <MoonIcon
            class="absolute h-[1rem] w-[1rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
          />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </div>
    </div>

    <Card.Content class="flex-1 overflow-auto px-0">
      <form class="flex flex-col gap-4" on:submit={handleSubmit}>
        <!-- Grid: Full Name & Title -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label
              for="fullname"
              class="text-gray-500 dark:text-gray-300 text-md">Full Name</Label
            >
            <Input
              id="fullname"
              type="text"
              placeholder="John Doe"
              required
              bind:value={fullname}
              class="py-5.5 text-md"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="title" class="text-gray-500 dark:text-gray-300 text-md"
              >Title</Label
            >
            <Input
              id="title"
              type="text"
              placeholder="Frontend Engineer"
              required
              bind:value={title}
              class="py-5.5"
            />
          </div>
        </div>

        <!-- Grid: Company & Tags -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label
              for="company"
              class="text-gray-500 dark:text-gray-300 text-md">Company</Label
            >
            <Input
              id="company"
              type="text"
              placeholder="MagicMind Inc."
              required
              bind:value={company}
              class="py-5.5"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="tags" class="text-gray-500 dark:text-gray-300 text-md"
              >Tags</Label
            >
            <Input
              id="tags"
              type="text"
              placeholder="Frontend, UI/UX, React"
              required
              bind:value={tags}
              class="py-5.5"
            />
          </div>
        </div>

        <!-- Grid: Tone & Goal -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label for="tone" class="text-gray-500 dark:text-gray-300 text-md"
              >Tone</Label
            >
            <Input
              id="tone"
              type="text"
              placeholder="Professional and approachable"
              required
              bind:value={tone}
              class="py-5.5"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="goal" class="text-gray-500 dark:text-gray-300 text-md"
              >Goal</Label
            >
            <Input
              id="goal"
              type="text"
              placeholder="Create a detailed professional bio"
              required
              bind:value={goal}
              class="py-5.5"
            />
          </div>
        </div>

        <!-- Buttons -->
        <Card.Footer class="flex flex-row gap-4 mt-4 px-0">
          <Button
            type="button"
            onclick={handleReset}
            class="flex-1 py-6 font-semibold text-lg dark:text-gray-300 bg-gradient-to-br from-blue-400 via-75% to-teal-500 dark:from-blue-700 dark:via-75% dark:to-teal-900"
            >Reset</Button
          >
          <Button
            type="submit"
            disabled={loadingAI}
            class="flex-1 py-6 font-semibold text-lg dark:text-gray-300 bg-gradient-to-br from-red-400 via-35% to-blue-500 dark:from-red-700 dark:via-35% dark:to-blue-800"
            >{loadingAI ? "Generating..." : "Generate"}</Button
          >
        
        </Card.Footer>
      </form>
    </Card.Content>
  </Card.Root>

  <!-- ===========================
       Second Card (AI Content)
  ============================ -->
  {#if showSecondCard}
    <div
      in:fly={{ x: 400, duration: 800 }}
      out:fly={{ x: 400, duration: 800 }}
      class="w-full  max-w-lg"
    >
      <Card.Root
        class="flex-col p-2 shadow-xl rounded-2xl h-[520px] bg-white/15   dark:bg-gray-900 "
      >
        <Card.Content
          class="bg-white/40 dark:bg-white/5 rounded-2xl p-0 flex-1 w-full max-w-2xl editor-wrapper  overflow-y-scroll hide-scrollbar"
        >
          {#if loadingAI}
            <!-- Loader -->
            <div class="flex justify-center items-center h-full">
              <span class="loader"></span>
            </div>
          {:else}
            <!-- AI-generated content -->
            <TiptapEditor content={editorContent} />
          {/if}
        </Card.Content>
      </Card.Root>
    </div>
  {/if}
</div>

<style>
  :global(.ProseMirror) {
    width: -webkit-fill-available;
    position: relative;
    border: none;
    padding: 0;
    outline: none;
  }

  /* Loader animation */
  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    animation: spin 1s linear infinite;
  }

 
</style>

