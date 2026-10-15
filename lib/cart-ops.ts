// Runs cart changes one after another, in the order they were made, so rapid
// clicks (+ + +) reach the server in order. Only the answer to the LAST pending
// change is applied to the screen: an earlier answer would show a state the
// shopper has already moved past and make the bag jump backwards. If the last
// change failed, the bag is re-read from the server, which also undoes a failed
// optimistic update.
export function createOpRunner(
  applyServer: (res: Response) => Promise<void> | void,
  resync: () => Promise<void> | void
) {
  let chain: Promise<void> = Promise.resolve();
  let pending = 0;

  return {
    /** Queue a request. Resolves when this change (and everything before it) has settled. */
    run(request: () => Promise<Response>): Promise<void> {
      pending += 1;
      chain = chain.then(async () => {
        let res: Response | null = null;
        try {
          res = await request();
        } catch {
          // Network failure: handled below like any failed change.
        }
        pending -= 1;
        if (pending === 0) {
          if (res && res.ok) await applyServer(res);
          else await resync();
        }
      });
      return chain;
    },
    get pending() {
      return pending;
    },
  };
}
