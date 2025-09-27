// src/lib/utils/aiFormatter.ts
export function formatAIContent(aiText: string): string {
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






//----------------------
// formate card airesponce code
//----------------------
 // function formatAIContent(aiText: string): string {
  //   if (!aiText) {
  //     return `<p class="text-gray-500 italic">No AI-generated content available</p>`;
  //   }

  //   const lines = aiText.split(/\n/);

  //   let isFirstHeading = true;

  //   const bodyLines = lines.map((line) => {
  //     let formatted = line.trim();
  //     if (!formatted) return "<br/>";

  //     // First heading (main title)
  //     if (isFirstHeading && /^\*\*(.+)\*\*$/.test(formatted)) {
  //       isFirstHeading = false;
  //       const cleanHeading = formatted.replace(/^\*\*(.+)\*\*$/, "$1");
  //       return `<h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">${cleanHeading}</h1>`;
  //     }

  //     // Subheadings
  //     if (/^\*\*(.+)\*\*$/.test(formatted)) {
  //       const cleanHeading = formatted.replace(/^\*\*(.+)\*\*$/, "$1");
  //       return `<h2 class="font-bold text-xl mt-6 mb-3 text-gray-900 dark:text-gray-100">${cleanHeading}</h2>`;
  //     }

  //     // Highlight job roles
  //     formatted = formatted.replace(
  //       /(Frontend Engineer|Backend Engineer|Full Stack Engineer|Designer|Developer|Manager|Engineer)/gi,
  //       `<span class="font-semibold text-blue-600 dark:text-blue-400">$1</span>`
  //     );

  //     // Italicize company names after "at"
  //     formatted = formatted.replace(
  //       /\bat ([A-Z][A-Za-z0-9& ]+)/g,
  //       `at <em>$1</em>`
  //     );

  //     return `<p class="leading-relaxed text-gray-800 dark:text-gray-200 mb-4">${formatted}</p>`;
  //   });

  //   return bodyLines.join("\n");
  // } 