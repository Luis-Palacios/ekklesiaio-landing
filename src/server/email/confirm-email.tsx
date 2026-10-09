import type { Locale } from "next-intl";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";
import { emailColors as c, emailFonts as f } from "./email-theme";

export type ConfirmEmailCopy = {
  preview: string;
  heading: string;
  body: string;
  button: string;
  ignore: string;
  unsubscribe: string;
};

type Props = {
  locale: Locale;
  copy: ConfirmEmailCopy;
  confirmUrl: string;
  unsubscribeUrl: string;
};

// Double opt-in email (docs/DESIGN.md §5.4). Copy is passed in, so this stays a pure
// template. The logo is HTML text: Gmail doesn't render SVG images.
export function ConfirmEmail({ locale, copy, confirmUrl, unsubscribeUrl }: Props) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{copy.preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: c.paper, fontFamily: f.sans }}>
        <Container style={{ maxWidth: 560, padding: "40px 16px" }}>
          <Text
            style={{
              margin: "0 0 24px",
              fontFamily: f.logo,
              fontSize: 22,
              fontWeight: 650,
              letterSpacing: "-0.03em",
              lineHeight: "28px",
            }}
          >
            <span style={{ color: c.navy900 }}>ekklesia</span>
            <span style={{ color: c.gold500 }}>io</span>
          </Text>

          <Section
            style={{
              backgroundColor: c.surface,
              border: `1px solid ${c.line}`,
              borderRadius: 16,
              padding: "32px 28px",
            }}
          >
            <Heading
              as="h1"
              style={{
                margin: "0 0 12px",
                fontFamily: f.display,
                fontSize: 30,
                fontWeight: 500,
                lineHeight: "36px",
                color: c.navy900,
              }}
            >
              {copy.heading}
            </Heading>
            <Text style={{ margin: "0 0 28px", fontSize: 16, lineHeight: "26px", color: c.ink }}>
              {copy.body}
            </Text>
            <Button
              href={confirmUrl}
              style={{
                display: "inline-block",
                backgroundColor: c.navy900,
                borderRadius: 10,
                padding: "15px 24px",
                fontSize: 16,
                fontWeight: 700,
                lineHeight: "22px",
                color: "#FFFFFF",
                textDecoration: "none",
              }}
            >
              {copy.button}
            </Button>
            <Hr style={{ margin: "32px 0 20px", borderColor: c.line }} />
            <Text style={{ margin: 0, fontSize: 14, lineHeight: "22px", color: c.muted }}>
              {copy.ignore}
            </Text>
          </Section>

          <Text style={{ margin: "20px 0 0", fontSize: 13, lineHeight: "20px", color: c.muted }}>
            <Link href={unsubscribeUrl} style={{ color: c.muted, textDecoration: "underline" }}>
              {copy.unsubscribe}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
