import { NextIntlClientProvider, useMessages } from "next-intl";
import type { WaitlistSource } from "@/lib/waitlist-schema";
import { WaitlistFormClient } from "./waitlist-form-client";

type Props = {
  variant: "light" | "dark";
  source: WaitlistSource;
};

// Server wrapper: hands the client form only the `form` messages it needs.
export function WaitlistForm(props: Props) {
  const { form } = useMessages();

  return (
    <NextIntlClientProvider messages={{ form }}>
      <WaitlistFormClient {...props} />
    </NextIntlClientProvider>
  );
}
