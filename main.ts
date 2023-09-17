import { App, Plugin, MarkdownPostProcessorContext, TFile } from 'obsidian';

export default class MyPlugin extends Plugin {
  async onload() {
    console.log("Plugin is loading");

    this.registerMarkdownPostProcessor(async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      console.log("Markdown Post Processor triggered");

      // Wait for Obsidian to render all the internal links.
      setTimeout(() => {
        console.log("Timeout done. Now looking for links.");

        // Select all internal links
        const internalLinks = el.querySelectorAll("a.internal-link");

        internalLinks.forEach(async (link: HTMLElement) => {
          console.log("Found an internal link: ", link);

          const linkName = link.innerText;
          console.log(`Link name is: ${linkName}`);

          const file: TFile | null = this.app.metadataCache.getFirstLinkpathDest(linkName, ctx.sourcePath);

          // Check if the file exists
          if (file === null) {
            console.log("File does not exist, appending 💀");
            link.append("💀");
            return;
          }

          const content = await this.app.vault.read(file);
          console.log(`File content: ${content}`);

          // Search for a status emoji in the first 5 lines of the file
          const lines = content.split('\n').slice(0, 5);

          let statusEmoji: string | null = null;

          for (const line of lines) {
            if (line.startsWith('#Status/Inbox')) {
              statusEmoji = '🚩';
              break;
            }
            if (line.startsWith('#Status/Working')) {
              statusEmoji = '🟨';
              break;
            }
            if (line.startsWith('#Status/Reviewing')) {
              statusEmoji = '🔶';
              break;
            }
            if (line.startsWith('#Status/Complete')) {
              statusEmoji = '🟢';
              break;
            }
            if (line.startsWith('#Status/Ongoing')) {
              statusEmoji = '♾️';
              break;
            }
          }

          if (statusEmoji) {
            console.log(`Appending status emoji: ${statusEmoji}`);
            link.append(` ${statusEmoji}`);
          }
        });
      }, 50);
    });
  }
}
