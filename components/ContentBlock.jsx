import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ContentBlock({ content, className, id }) {
  const html =
    typeof content === 'string'
      ? `<p>${escapeHtml(content)}</p>`
      : content?.nodeType
        ? documentToHtmlString(content)
        : '';

  return (
    <div
      className={className}
      id={id}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default ContentBlock;
