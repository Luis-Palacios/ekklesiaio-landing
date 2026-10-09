"use client";

import { useFormStatus } from "react-dom";
import { SpinnerIcon } from "./icons";

// Submit button for server-rendered forms: disabled with a spinner while posting.
export function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <SpinnerIcon className="size-[18px] animate-spin motion-reduce:animate-none" />}
      <span>{pending ? pendingLabel : label}</span>
    </button>
  );
}
