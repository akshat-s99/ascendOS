/**
 * Unit tests for ActivityLogger — form reset after successful submission.
 * Requirements: 1.4
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityLogger from './ActivityLogger';
import type { AscendState } from '@/lib/types/ascend';
import { getDefaultState } from '@/lib/storage/persist';

function makeState(overrides?: Partial<AscendState>): AscendState {
  return { ...getDefaultState(), ...overrides };
}

describe('ActivityLogger — form reset after submission', () => {
  it('resets title, notes, and duration to defaults after a valid submission', async () => {
    const logActivity = vi.fn();
    const state = makeState();

    render(
      <ActivityLogger
        state={state}
        logActivity={logActivity}
        toggleActivity={vi.fn()}
        deleteActivity={vi.fn()}
      />
    );

    // Open the form
    fireEvent.click(screen.getByRole('button', { name: /log activity/i }));

    // Fill in the fields
    const titleInput = screen.getByPlaceholderText('What did you do?');
    const durInput = screen.getByLabelText(/duration/i);
    const notesInput = screen.getByLabelText(/notes/i);

    fireEvent.change(titleInput, { target: { value: 'Morning run' } });
    fireEvent.change(durInput, { target: { value: '45' } });
    fireEvent.change(notesInput, { target: { value: 'Felt great' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /record activity/i }));

    // logActivity should have been called once
    expect(logActivity).toHaveBeenCalledOnce();

    // Fields should be reset to defaults
    expect(titleInput).toHaveValue('');
    expect(durInput).toHaveValue(30);
    expect(notesInput).toHaveValue('');
  });

  it('does NOT call logActivity when title is empty', () => {
    const logActivity = vi.fn();
    const state = makeState();

    render(
      <ActivityLogger
        state={state}
        logActivity={logActivity}
        toggleActivity={vi.fn()}
        deleteActivity={vi.fn()}
      />
    );

    // Open the form
    fireEvent.click(screen.getByRole('button', { name: /log activity/i }));

    // Leave title empty and submit
    fireEvent.click(screen.getByRole('button', { name: /record activity/i }));

    expect(logActivity).not.toHaveBeenCalled();
  });

  it('does NOT call logActivity when title is whitespace-only', () => {
    const logActivity = vi.fn();
    const state = makeState();

    render(
      <ActivityLogger
        state={state}
        logActivity={logActivity}
        toggleActivity={vi.fn()}
        deleteActivity={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /log activity/i }));

    const titleInput = screen.getByPlaceholderText('What did you do?');
    fireEvent.change(titleInput, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /record activity/i }));

    expect(logActivity).not.toHaveBeenCalled();
  });
});
