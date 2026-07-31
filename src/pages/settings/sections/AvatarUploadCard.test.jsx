import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Phase 32-02 — the Settings profile-picture control.
 *
 * The headline behaviour: this works for ANY user regardless of KYC status. The
 * old KYC picture endpoint blocked approved users entirely, which is why the
 * feature appeared missing.
 */

const mockUpload = vi.fn();
const mockRemove = vi.fn();
let uploadPending = false;
let removePending = false;

vi.mock('../../../modules/profile/hooks/useAvatar', () => ({
  useUploadAvatar: () => ({ mutate: mockUpload, isPending: uploadPending }),
  useRemoveAvatar: () => ({ mutate: mockRemove, isPending: removePending }),
  avatarErrorMessage: (err, fallback) =>
    err?.response?.data?.error?.message || err?.message || fallback,
}));

import AvatarUploadCard from './AvatarUploadCard';

const withPicture = {
  first_name: 'Ama',
  last_name: 'Mensah',
  avatar_url: 'https://cdn.example.com/ama.jpg',
};

const withoutPicture = { first_name: 'Kofi', last_name: 'Boateng', avatar_url: null };

const file = (name, type, sizeBytes = 1024) => {
  const f = new File([new Uint8Array(sizeBytes)], name, { type });
  return f;
};

beforeEach(() => {
  vi.clearAllMocks();
  uploadPending = false;
  removePending = false;
  // jsdom lacks these; the card uses them for the optimistic preview.
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
  globalThis.URL.revokeObjectURL = vi.fn();
});

describe('AvatarUploadCard', () => {
  it('shows the current picture and a Change action', () => {
    render(<AvatarUploadCard user={withPicture} />);
    expect(screen.getByRole('img', { name: 'Ama Mensah' }))
      .toHaveAttribute('src', 'https://cdn.example.com/ama.jpg');
    expect(screen.getByText(/Change photo/i)).toBeInTheDocument();
  });

  it('shows initials and an Upload action when there is no picture', () => {
    render(<AvatarUploadCard user={withoutPicture} />);
    expect(screen.getByText('KB')).toBeInTheDocument();
    expect(screen.getByText(/Upload photo/i)).toBeInTheDocument();
  });

  it('uploads a valid image', async () => {
    const user = userEvent.setup();
    render(<AvatarUploadCard user={withoutPicture} />);

    await user.upload(
      screen.getByLabelText(/Upload photo/i, { selector: 'input' }),
      file('me.png', 'image/png'),
    );

    await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(1));
  });

  it('rejects a non-image client-side WITHOUT sending a request', async () => {
    render(<AvatarUploadCard user={withoutPicture} />);
    const input = screen.getByLabelText(/Upload photo/i, { selector: 'input' });

    // NOTE: userEvent.upload() honours the input's `accept` attribute and
    // silently DISCARDS a non-matching file, so it can't reach the handler.
    // `accept` is only a picker hint (bypassable via drag-drop or "All files"),
    // so the component's own check is real defence — exercise it directly.
    fireEvent.change(input, { target: { files: [file('resume.pdf', 'application/pdf')] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/JPG, PNG and WEBP/i);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('rejects an oversized image client-side', async () => {
    render(<AvatarUploadCard user={withoutPicture} />);
    const input = screen.getByLabelText(/Upload photo/i, { selector: 'input' });

    fireEvent.change(input, {
      target: { files: [file('huge.png', 'image/png', 3 * 1024 * 1024)] }, // over the 2 MB cap
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/under 2 MB/i);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('surfaces the SERVER message when the upload is rejected', async () => {
    mockUpload.mockImplementation((_f, opts) =>
      opts.onError({ response: { data: { error: { message: 'Image is corrupt.' } } } }),
    );
    const user = userEvent.setup();
    render(<AvatarUploadCard user={withoutPicture} />);

    await user.upload(
      screen.getByLabelText(/Upload photo/i, { selector: 'input' }),
      file('ok.png', 'image/png'),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Image is corrupt.');
  });

  it('confirms success after a successful upload', async () => {
    mockUpload.mockImplementation((_f, opts) => opts.onSuccess());
    const user = userEvent.setup();
    render(<AvatarUploadCard user={withoutPicture} />);

    await user.upload(
      screen.getByLabelText(/Upload photo/i, { selector: 'input' }),
      file('ok.png', 'image/png'),
    );

    expect(await screen.findByRole('status')).toHaveTextContent(/updated/i);
  });

  it('hides Remove when there is no picture', () => {
    render(<AvatarUploadCard user={withoutPicture} />);
    expect(screen.queryByRole('button', { name: /Remove/i })).not.toBeInTheDocument();
  });

  it('removes the picture after confirmation', async () => {
    mockRemove.mockImplementation((_v, opts) => opts.onSuccess());
    const user = userEvent.setup();
    render(<AvatarUploadCard user={withPicture} />);

    await user.click(screen.getByRole('button', { name: /^Remove$/i }));

    // The modal adds a SECOND "Remove" button, so scope to the dialog to
    // disambiguate the confirm from the trigger.
    const dialog = await screen.findByText(/Remove profile picture\?/i);
    const modal = dialog.closest('div[class*="fixed"]') || document.body;
    await user.click(within(modal).getByRole('button', { name: /^Remove$/i }));

    await waitFor(() => expect(mockRemove).toHaveBeenCalled());
  });
});
