import React from 'react';
import Markdown from 'react-markdown';

interface MDXFeatureContentProps {
  content: string;
}

export default function MarkdownFeatureContent({
  content,
}: MDXFeatureContentProps): React.ReactElement {
  if (!content || content.trim() === '') {
    return <span className='no-content'>None</span>;
  }

  // Create a simple wrapper around the MDX content
  const MarkdownWrapper = () => {
    return <Markdown>{content}</Markdown>;
  };

  return <MarkdownWrapper />;
}
