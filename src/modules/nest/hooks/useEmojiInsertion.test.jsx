import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useEmojiInsertion } from './useEmojiInsertion';

/** Minimal host so the hook is exercised through a real textarea + DOM events. */
function Host() {
  const [text, setText] = useState('hello world');
  const { showEmojiPicker, setShowEmojiPicker, pickerRef, textareaRef, handleEmojiSelect } =
    useEmojiInsertion(text, setText);
  return (
    <div>
      <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} aria-label="box" />
      <button onClick={() => setShowEmojiPicker(true)}>open</button>
      {showEmojiPicker && (
        <div ref={pickerRef} data-testid="picker">
          <button onClick={() => handleEmojiSelect({ native: '🎉' })}>pick</button>
        </div>
      )}
      <p data-testid="outside">outside</p>
    </div>
  );
}

describe('useEmojiInsertion', () => {
  it('inserts the emoji at the caret, not at the end', () => {
    render(<Host />);
    const box = screen.getByLabelText('box');
    box.setSelectionRange(5, 5); // between "hello" and " world"
    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('pick'));
    expect(box.value).toBe('hello🎉 world');
  });

  it('replaces the current selection', () => {
    render(<Host />);
    const box = screen.getByLabelText('box');
    box.setSelectionRange(0, 5); // "hello" selected
    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('pick'));
    expect(box.value).toBe('🎉 world');
  });

  it('closes the picker after a pick', () => {
    render(<Host />);
    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('pick'));
    expect(screen.queryByTestId('picker')).not.toBeInTheDocument();
  });

  it('closes on an outside click but not on a click inside the picker', () => {
    render(<Host />);
    fireEvent.click(screen.getByText('open'));

    act(() => { fireEvent.mouseDown(screen.getByTestId('picker')); });
    expect(screen.getByTestId('picker')).toBeInTheDocument();

    act(() => { fireEvent.mouseDown(screen.getByTestId('outside')); });
    expect(screen.queryByTestId('picker')).not.toBeInTheDocument();
  });
});
