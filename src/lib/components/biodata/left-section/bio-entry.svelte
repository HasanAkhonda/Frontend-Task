<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { formatAIContent } from "$lib/utils/ai-formatter";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import { toggleMode } from "mode-watcher";
  import AnimatedCardWrapper from "$lib/components/reusable/custom-ui/animated-card-wrapper.svelte";
  import CustomButton from "$lib/components/reusable/custom-ui/custom-button.svelte";
  import CardWrapper from "$lib/components/reusable/wrappers/card-wrapper.svelte";
  import LayoutWrapper from "$lib/components/reusable/wrappers/layout-wrapper.svelte";
  import GenerationPannel from "../right-section/generation-pannel.svelte";
  import BioForm from "./bio-form.svelte";
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
    <Card.Content class="flex-1 px-0">
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
  </CardWrapper>

  <!-- ===========================
       Second Card (AI Content)
  ============================ -->
  <!-- {#if showSecondCard} -->
  <AnimatedCardWrapper show={showSecondCard}>
    <GenerationPannel {loadingAI} {editorContent} />
  </AnimatedCardWrapper>
  <!-- {/if} -->
</LayoutWrapper>
