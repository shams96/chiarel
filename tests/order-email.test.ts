import { describe, it, expect, vi, beforeEach } from "vitest";

const findUnique = vi.fn();
const update = vi.fn();
const sendMail = vi.fn();
vi.mock("@/lib/db", () => ({
  db: { order: { findUnique: (...a: unknown[]) => findUnique(...a), update: (...a: unknown[]) => update(...a) } },
}));
vi.mock("@/lib/mail", () => ({ sendMail: (...a: unknown[]) => sendMail(...a) }));

const { composeOrderConfirmation, sendOrderConfirmation } = await import("@/lib/order-email");

const order = (over: Record<string, unknown> = {}) => ({
  id: "cl_abcdefgh12345678",
  firstName: "Ada",
  email: "ada@example.com",
  subtotal: 236,
  savings: 24,
  shipping: 0,
  total: 236,
  amountPaidCents: null,
  taxCents: null,
  confirmationEmailAt: null,
  items: [{ qty: 2, unitPrice: 118, mode: "subscription", product: { name: "Clarity Essence" } }],
  ...over,
});

beforeEach(() => {
  findUnique.mockReset();
  update.mockReset();
  sendMail.mockReset();
  sendMail.mockResolvedValue(undefined);
  update.mockResolvedValue({});
});

describe("composeOrderConfirmation", () => {
  it("names the order by the same short reference the order page shows", () => {
    const { subject, text } = composeOrderConfirmation(order() as any);
    expect(subject).toBe("Your CHIAREL order #12345678");
    expect(text).toContain("order #12345678");
  });

  it("lists each line, savings and complimentary shipping, with no tax line when there is none", () => {
    const { text } = composeOrderConfirmation(order() as any);
    expect(text).toContain("Clarity Essence (Subscription) x 2   $236.00");
    expect(text).toContain("Ritual savings (already applied)   -$24.00");
    expect(text).toContain("Shipping   Complimentary");
    expect(text).not.toContain("Tax");
    expect(text).toContain("Total   $236.00");
  });

  it("shows tax and labels the total as including it", () => {
    const { text } = composeOrderConfirmation(order({ amountPaidCents: 25488, taxCents: 1888 }) as any);
    expect(text).toContain("Tax   $18.88");
    expect(text).toContain("Total (incl. tax)   $254.88");
  });

  it("promises nothing about delivery dates or the guarantee", () => {
    const { text } = composeOrderConfirmation(order() as any);
    expect(text.toLowerCase()).not.toMatch(/deliver|arrive|days|guarantee|refund/);
  });
});

describe("sendOrderConfirmation", () => {
  it("sends to the order's email and records when it went out", async () => {
    findUnique.mockResolvedValue(order());
    await sendOrderConfirmation("cl_abcdefgh12345678");
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0]).toMatchObject({ to: "ada@example.com" });
    expect(update.mock.calls[0][0].data.confirmationEmailAt).toBeInstanceOf(Date);
  });

  it("does not send twice for an order already confirmed", async () => {
    findUnique.mockResolvedValue(order({ confirmationEmailAt: new Date() }));
    await sendOrderConfirmation("x");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("does not record a send that failed, so the page never claims an email that did not leave", async () => {
    findUnique.mockResolvedValue(order());
    sendMail.mockRejectedValue(new Error("smtp down"));
    await expect(sendOrderConfirmation("x")).rejects.toThrow("smtp down");
    expect(update).not.toHaveBeenCalled();
  });

  it("does nothing for an unknown order", async () => {
    findUnique.mockResolvedValue(null);
    await sendOrderConfirmation("x");
    expect(sendMail).not.toHaveBeenCalled();
  });
});
