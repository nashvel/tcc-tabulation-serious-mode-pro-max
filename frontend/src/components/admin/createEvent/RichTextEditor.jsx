export default function RichTextEditor({ value, onChange }) {
  const handleFormat = (command) => {
    const editor = document.getElementById('description-editor');
    editor.focus();
    document.execCommand(command, false, null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Event Description</label>
      
      {/* Rich Text Toolbar */}
      <div style={{
        border: '1px solid #d1d5db',
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        padding: '8px',
        backgroundColor: '#f9fafb',
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontStyle: 'italic'
          }}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => handleFormat('underline')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          title="Underline"
        >
          U
        </button>
        <div style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />
        <button
          type="button"
          onClick={() => handleFormat('insertUnorderedList')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => handleFormat('insertOrderedList')}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
          title="Numbered List"
        >
          1. List
        </button>
      </div>
      
      {/* Rich Text Editor */}
      <textarea
        id="description-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your description here..."
        rows={5}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '0 0 8px 8px',
          backgroundColor: '#fff',
          outline: 'none',
          fontSize: '14px',
          lineHeight: '1.5',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
      />
      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        Enter your event description (formatting will be available in future updates)
      </p>
    </div>
  );
}
