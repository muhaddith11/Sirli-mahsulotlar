"use client";

import type { ComponentProps } from "react";

/** Qiymati o'zgarganda o'zi joylashgan formani yuboradigan select */
export function AutoSubmitSelect(props: ComponentProps<"select">) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
