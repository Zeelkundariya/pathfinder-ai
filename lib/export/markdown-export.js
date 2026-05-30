export function generateMarkdownExport(conversation) {
  let markdown = `# ${conversation.title}\n\n`;

  conversation.messages.forEach((message) => {
    markdown += `## ${message.role}\n\n`;
    markdown += `${message.content}\n\n`;
  });

  return markdown;
}