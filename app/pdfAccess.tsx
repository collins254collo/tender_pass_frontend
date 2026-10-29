'use client';

import { ChangeEvent, useRef, useState } from 'react';

const MAX_BYTES = 20 * 1024 * 1024; // same limit as the server

const BTN =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#0B6B4B] px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-[#095C40] cursor-pointer';

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Opens the device's file picker, checks the chosen file, and shows the result.
export function ChoosePdfButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = ''; // lets the user choose the same file again later
    if (!picked) return; // the picker was cancelled: keep the previous choice

    const isPdf = picked.type === 'application/pdf' || picked.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setFile(null);
      setError('This file is not a PDF. Please choose the tender as a PDF.');
    } else if (picked.size === 0) {
      setFile(null);
      setError('This file is empty. Please choose another PDF.');
    } else if (picked.size > MAX_BYTES) {
      setFile(null);
      setError('This PDF is larger than 20 MB. Please choose a smaller file.');
    } else {
      setError(null);
      setFile(picked);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        aria-label="Tender PDF"
        tabIndex={-1}
        className="sr-only"
        onChange={onChange}
      />
      <button type="button" className={BTN} onClick={() => inputRef.current?.click()}>
        {file ? 'Choose a different PDF' : 'Choose PDF'}
      </button>

      {file && (
        <p role="status" className="m-0 max-w-full truncate text-sm font-medium text-[#085D3A]">
          Selected: {file.name} ({formatSize(file.size)})
        </p>
      )}
      {error && (
        <p role="alert" className="m-0 rounded-lg bg-[#FDECEA] px-3 py-2 text-sm font-medium text-[#912018]">
          {error}
        </p>
      )}
    </>
  );
}