<script lang="ts">
  import CustomButton from "./../reusable/custom-ui/custom-button.svelte";
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
  import LayoutWrapper from "../reusable/wrappers/layout-wrapper/layout-wrapper.svelte";
  import CardWrapper from "../reusable/wrappers/card-wrapper/card-wrapper.svelte";
  import CustomLabeledInput from "../reusable/custom-ui/custom-labeled-input.svelte";
  import CustomLoader from "../reusable/custom-ui/custom-loader.svelte";
  import AnimatedCardWrapper from "../reusable/custom-ui/animated-card-wrapper.svelte";
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

<!-- ===========================
     Layout Wrapper
=========================== -->
<LayoutWrapper>
  <!-- ===========================
       First Card (Form)
  ============================ -->
  <CardWrapper
    cardStyle={`${showSecondCard ? "md:translate-x-[0%]" : "md:translate-x-[53%]"}`}
  >
    <div class="relative w-full flex justify-center items-center mb-6">
      <h1
        class="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
      >
        MagicMind
      </h1>
      <div class="absolute -right-6 -top-6">
        <CustomButton
          Onclicked={toggleMode}
          buttonSize="icon"
          buttonStyle=""
          customVarient="ghost"
        >
          <SunIcon
            class="h-[1rem] w-[1rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
          />
          <MoonIcon
            class="absolute h-[1rem] w-[1rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
          />
        </CustomButton>
      </div>
    </div>

    <Card.Content class="flex-1  px-0">
      <form class="flex flex-col gap-4" on:submit={handleSubmit}>
        <!-- Grid: Full Name & Title -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
        </div>

        <!-- Grid: Company & Tags -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
        </div>

        <!-- Grid: Tone & Goal -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
        </div>

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

          <!-- <Button
            type="submit"
            disabled={loadingAI}
            class="flex-1 py-6 font-semibold text-lg dark:text-gray-300 bg-gradient-to-br from-red-400 via-35% to-blue-500 dark:from-red-700 dark:via-35% dark:to-blue-800"
            >{loadingAI ? "Generating" : "Generate"}</Button
          > -->
        </Card.Footer>
      </form>
    </Card.Content>
  </CardWrapper>

  <!-- ===========================
       Second Card (AI Content)
  ============================ -->
  <!-- {#if showSecondCard} -->
  <AnimatedCardWrapper show={showSecondCard}>
    <Card.Root
      class="flex-col p-2 shadow-xl rounded-2xl h-full  max-h-[520px] md:h-[520px] bg-white/15   dark:bg-gray-900   "
    >
      <Card.Content
        class="bg-white/40 dark:bg-white/5 rounded-2xl p-0 flex-1 w-full max-w-2xl editor-wrapper  "
      >
        {#if loadingAI}
          <!-- Loader -->
          <div class="flex justify-center items-center h-[504px]">
            <CustomLoader />
          </div>
        {:else}
          <!-- AI-generated content -->
          <TiptapEditor content={editorContent} />
        {/if}
      </Card.Content>
    </Card.Root>
  </AnimatedCardWrapper>
  <!-- {/if} -->
</LayoutWrapper>
