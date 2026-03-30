import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendOrderConfirmationMail(to: string, name: string, orderId: number, total: number) {
  await mailer.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "Ecommerce"}" <${process.env.MAIL_FROM}>`,
    to,
    subject: `Order #${orderId} Confirmed`,
    html: `
      <h2>Hi ${name},</h2>
      <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
      <p>Total: <strong>$${Number(total).toFixed(2)}</strong></p>
      <p>We'll notify you when it ships.</p>
    `,
  });
}
