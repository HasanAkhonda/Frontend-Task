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

  // -----------------------------
  // Local state
  // -----------------------------
  let editorContent = "";

  function formatAIContent(aiText: string): string {
    if (!aiText) {
      return `<p class="text-gray-500 italic">No AI-generated content available</p>`;
    }

    const lines = aiText.split(/\n/);

    let isFirstHeading = true;

    const bodyLines = lines.map((line) => {
      let formatted = line.trim();
      if (!formatted) return "<br/>";

      // First heading (main title)
      if (isFirstHeading && /^\*\*(.+)\*\*$/.test(formatted)) {
        isFirstHeading = false;
        const cleanHeading = formatted.replace(/^\*\*(.+)\*\*$/, "$1");
        return `<h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">${cleanHeading}</h1>`;
      }

      // Subheadings
      if (/^\*\*(.+)\*\*$/.test(formatted)) {
        const cleanHeading = formatted.replace(/^\*\*(.+)\*\*$/, "$1");
        return `<h2 class="font-bold text-xl mt-6 mb-3 text-gray-900 dark:text-gray-100">${cleanHeading}</h2>`;
      }

      // Highlight job roles
      formatted = formatted.replace(
        /(Frontend Engineer|Backend Engineer|Full Stack Engineer|Designer|Developer|Manager|Engineer)/gi,
        `<span class="font-semibold text-blue-600 dark:text-blue-400">$1</span>`
      );

      // Italicize company names after "at"
      formatted = formatted.replace(
        /\bat ([A-Z][A-Za-z0-9& ]+)/g,
        `at <em>$1</em>`
      );

      return `<p class="leading-relaxed text-gray-800 dark:text-gray-200 mb-4">${formatted}</p>`;
    });

    return bodyLines.join("\n");
  }

  // function formatAIContent(aiText: string) {
  //     // Split the first line (heading) and the rest (paragraph)
  //     const lines = aiText.split("**").filter(Boolean); // remove empty lines
  //     const heading = lines[0] || "Generated Description";
  //     const paragraph = lines.slice(1).join("<br>"); // join remaining lines

  //     // Return HTML string
  //     return `
  //     <h2 class="text-lg font-semibold mb-4">${heading}</h2>
  //     <p class="text-gray-700 dark:text-gray-200">${paragraph}</p>
  //   `;
  //   }

  function handleEditorUpdate(html: any) {
    editorContent = html;
    console.log("Editor content:", html);
  }

  let showSecondCard = false;

  // Form data variables
  let fullname = "";
  let title = "";
  let company = "";
  let tags = "";
  let tone = "";
  let goal = "";

  // Store submitted data separately
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
  // Handlers
  // -----------------------------
  async function handleSubmit(e: Event) {
    e.preventDefault();

    submittedData = { fullname, title, company, tags, tone, goal };
    console.log("Form Data:", submittedData);

    showSecondCard = true;

    // Build prompt dynamically
    const prompt = `
You are a professional AI writing assistant.
Generate a detailed, human-like professional bio using the following user info. 
The bio should feel authentic, well-structured, and suitable for professional use (portfolio, LinkedIn, company website).

Full Name: ${fullname}
Title: ${title}
Company: ${company}
Tags: ${tags}
Tone: ${tone}
Goal: ${goal}

Format:
- A clear and professional Title/Heading with the full name and role.
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
          messages: [
            {
              role: "user",
              content: prompt, // <-- send dynamic prompt
            },
          ],
        }),
      });

      const result = await response.json();
      console.log("AI Response:", result);
      // Check if response has the expected structure
      if (result?.message?.content?.length > 0) {
        const aiText = result.message.content[0].text;
        console.log("AI Generated Text:", aiText);

        // Assign to editor content
        editorContent = formatAIContent(aiText);
      } else {
        console.log("No AI text returned");
        editorContent = "No AI text returned";
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      editorContent = "Error fetching AI response";
    }
  }

  function handleReset() {
    fullname = "";
    title = "";
    company = "";
    tags = "";
    tone = "";
    goal = "";
    editorContent = "";
    showSecondCard = false;
  }
</script>

<!-- ===========================
     Layout Wrapper
     =========================== -->
<div
  class="flex flex-col bg-gradient-to-tr from-red-400/50 via-35% to-blue-500/50 dark:bg-[url('https://images.unsplash.com/photo-1610505466122-b1d9482901ef?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0')] bg-cover bg-center bg-no-repeat w-full h-screen md:flex-row justify-center items-center gap-10 px-4 md:px-0 my-auto"
>
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
            class="h-[1rem] w-[1.rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
          />
          <MoonIcon
            class="absolute h-[1rem] w-[1rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
          />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </div>
    </div>

    <Card.Content class="flex-1 overflow-auto px-0 ">
      <form class="flex flex-col gap-4 space-y-1" on:submit={handleSubmit}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label
              class="text-gray-500 dark:text-gray-300 text-md"
              for="fullname">Full Name</Label
            >
            <Input
              class="py-5.5 placeholder:text-md text-md "
              id="fullname"
              type="text"
              placeholder="John Doe"
              required
              bind:value={fullname}
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label class="text-gray-500 dark:text-gray-300 text-md" for="title"
              >Title</Label
            >
            <Input
              class="py-5.5 "
              id="title"
              type="text"
              placeholder="Frontend Engineer"
              required
              bind:value={title}
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label
              class="text-gray-500 dark:text-gray-300 text-md"
              for="company">Company</Label
            >
            <Input
              class="py-5.5 "
              id="company"
              type="text"
              placeholder="MagicMind Inc."
              required
              bind:value={company}
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label class="text-gray-500 dark:text-gray-300 text-md" for="tags"
              >Tags</Label
            >
            <Input
              class="py-5.5 "
              id="tags"
              type="text"
              placeholder="Frontend, UI/UX, React"
              required
              bind:value={tags}
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label class="text-gray-500 dark:text-gray-300 text-md" for="tone"
              >Tone</Label
            >
            <Input
              class="py-5.5 "
              id="tone"
              type="text"
              placeholder="Professional and approachable"
              required
              bind:value={tone}
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label class="text-gray-500 dark:text-gray-300 text-md" for="goal"
              >Goal</Label
            >
            <Input
              class="py-5.5 "
              id="goal"
              type="text"
              placeholder="Create a detailed professional bio"
              required
              bind:value={goal}
            />
          </div>
        </div>

        <Card.Footer class="flex flex-row gap-4 mt-4 px-0">
          <Button
            type="button"
            onclick={handleReset}
            class="flex-1 py-6 font-semibold text-lg bg-gradient-to-br from-blue-400 via-blue-400 to-teal-500"
          >
            Reset
          </Button>
          <Button
            type="submit"
            class="flex-1 py-6 font-semibold text-lg bg-gradient-to-br from-red-400 via-35% to-blue-500"
          >
            Generate
          </Button>
        </Card.Footer>
      </form>
    </Card.Content>
  </Card.Root>
  {#if showSecondCard}
    <div
      in:fly={{ x: 400, duration: 800 }}
      out:fly={{ x: 400, duration: 800 }}
      class="w-full max-w-lg"
    >
      <Card.Root
        class="flex-col p-2 shadow-xl rounded-2xl h-[520px] bg-white/15 dark:bg-gray-900"
      >
        <Card.Content
          class="bg-white/40 dark:bg-white/5 rounded-2xl p-0 flex-1 w-full max-w-2xl z-50 overflow-y-auto hide-scrollbar"
        >
          <TiptapEditor content={editorContent} />
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
    padding: 0px;
    outline: none;
  }
</style>
