export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
};

export const INITIAL_ACTION_RESULT: ActionResult = { ok: false };
