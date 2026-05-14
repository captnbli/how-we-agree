import type { EmailSender } from './types';

export const consoleEmailSender: EmailSender = {
  async send(to, subject, body) {
    console.log(`\n╔═ EMAIL ═══════════════════════════════`);
    console.log(`║ To:      ${to}`);
    console.log(`║ Subject: ${subject}`);
    console.log(`╟───────────────────────────────────────`);
    body.split('\n').forEach((line) => console.log(`║ ${line}`));
    console.log(`╚═══════════════════════════════════════\n`);
  },
};
