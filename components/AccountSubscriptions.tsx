"use client";

import { useState } from "react";
import Image from "next/image";
import { getProduct } from "@/lib/products";

const CADENCE_DAYS = 45;

type Subscription = {
  id: string;
  slug: string;
  paused: boolean;
  nextDelivery: Date;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Arbitrary reference point for the mock account — always computed forward
// from "today" so the preview never shows a stale date.
const REFERENCE_TODAY = new Date();

const initialSubscriptions: Subscription[] = [
  {
    id: "sub-founding-pair",
    slug: "the-founding-pair",
    paused: false,
    nextDelivery: addDays(REFERENCE_TODAY, CADENCE_DAYS),
  },
  {
    id: "sub-cellular-cleanser",
    slug: "cellular-cleanser",
    paused: false,
    nextDelivery: addDays(REFERENCE_TODAY, 12),
  },
];

export default function AccountSubscriptions() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(initialSubscriptions);
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(
    null
  );
  const [skipConfirmedId, setSkipConfirmedId] = useState<string | null>(null);
  const [undoNotice, setUndoNotice] = useState<{
    id: string;
    subscription: Subscription;
    name: string;
  } | null>(null);

  const togglePause = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, paused: !s.paused } : s))
    );
  };

  const skipNextDelivery = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, nextDelivery: addDays(s.nextDelivery, CADENCE_DAYS) }
          : s
      )
    );
    setSkipConfirmedId(id);
    setTimeout(
      () => setSkipConfirmedId((cur) => (cur === id ? null : cur)),
      2200
    );
  };

  const cancelSubscription = (id: string) => {
    const subscription = subscriptions.find((s) => s.id === id);
    if (!subscription) return;
    const product = getProduct(subscription.slug);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    setConfirmingCancel(null);
    setUndoNotice({ id, subscription, name: product?.name ?? "your ritual" });
    setTimeout(() => {
      setUndoNotice((cur) => (cur?.id === id ? null : cur));
    }, 6000);
  };

  const undoCancel = () => {
    if (!undoNotice) return;
    setSubscriptions((prev) =>
      [...prev, undoNotice.subscription].sort((a, b) =>
        a.id.localeCompare(b.id)
      )
    );
    setUndoNotice(null);
  };

  return (
    <>
      <div className="mt-12 space-y-5">
        {subscriptions.length === 0 && (
          <div className="card-elevated rounded-md bg-white p-8 text-center text-sm text-ink/60">
            No active subscriptions.
          </div>
        )}

        {subscriptions.map((sub) => {
          const product = getProduct(sub.slug);
          if (!product) return null;

          return (
            <div
              key={sub.id}
              className={`card-elevated rounded-md bg-white p-6 transition-opacity ${
                sub.paused ? "opacity-55" : "opacity-100"
              }`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-cloud/50">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-serif text-lg leading-tight">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ochre">
                    Ritual Plan
                  </p>
                  <p className="tabular-nums mt-0.5 text-[12px] text-ink/50">
                    Delivered every {CADENCE_DAYS} days · $
                    {product.price.subscription}/delivery
                  </p>
                  {sub.paused ? (
                    <p className="mt-2 text-[13px] text-ink/60">
                      Paused — resumes {formatDate(sub.nextDelivery)}
                    </p>
                  ) : (
                    <p className="mt-2 text-[13px] text-ink/60">
                      Next delivery {formatDate(sub.nextDelivery)}
                      {skipConfirmedId === sub.id && (
                        <span className="ml-2 text-ochre">
                          — delivery skipped
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {confirmingCancel === sub.id ? (
                <div className="mt-5 border-t border-ink/10 pt-4">
                  <p className="text-[13px] leading-relaxed text-ink/70">
                    Are you sure? This cancels your subscription to{" "}
                    {product.name}.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => cancelSubscription(sub.id)}
                      className="btn-press border border-ink px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-ink transition hover:border-ochre hover:text-ochre"
                    >
                      Yes, Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingCancel(null)}
                      className="btn-press px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-ink/50 transition hover:text-ink"
                    >
                      Keep Ritual
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-ink/10 pt-4">
                  {sub.paused ? (
                    <button
                      type="button"
                      onClick={() => togglePause(sub.id)}
                      className="btn-press border border-ink px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-ink transition hover:border-ochre hover:text-ochre"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => togglePause(sub.id)}
                      className="btn-press border border-ink/20 px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-ink/70 transition hover:border-ochre hover:text-ochre"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={sub.paused}
                    onClick={() => skipNextDelivery(sub.id)}
                    className="btn-press border border-ink/20 px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-ink/70 transition hover:border-ochre hover:text-ochre disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink/20 disabled:hover:text-ink/70"
                  >
                    Skip Next Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(sub.id)}
                    className="btn-press px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-ink/40 transition hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {undoNotice && (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-4 border border-ink bg-ink px-5 py-3 text-ivory shadow-lg">
          <p className="text-[12px]">
            Cancelled your subscription to {undoNotice.name}.
          </p>
          <button
            type="button"
            onClick={undoCancel}
            className="btn-press text-[11px] uppercase tracking-[0.2em] text-ochre underline underline-offset-2"
          >
            Undo
          </button>
        </div>
      )}
    </>
  );
}
