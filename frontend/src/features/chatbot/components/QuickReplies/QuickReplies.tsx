import styles from './QuickReplies.module.css';

// Quick reply can be a simple string or an object with text and value
export interface QuickReply {
  text: string;
  value: string;
}

interface QuickRepliesProps {
  suggestions?: string[];
  quickReplies?: QuickReply[];
  onSelect: (text: string) => void;
}

export function QuickReplies({ suggestions, quickReplies, onSelect }: QuickRepliesProps) {
  // Support both simple suggestions and quick replies with values
  const items: QuickReply[] = quickReplies ||
    (suggestions?.map(s => ({ text: s, value: s })) || []);

  if (items.length === 0) return null;

  return (
    <div className={styles.container}>
      {items.map((item, index) => (
        <button
          key={index}
          className={styles.chip}
          onClick={() => onSelect(item.value)}
          title={item.value !== item.text ? item.value : undefined}
        >
          {item.text}
        </button>
      ))}
    </div>
  );
}

export default QuickReplies;
