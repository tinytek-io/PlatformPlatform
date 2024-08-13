/**
 * ref: https://react-spectrum.adobe.com/react-aria-tailwind-starter/?path=/docs/form--docs
 * ref: https://ui.shadcn.com/docs/components/form
 */
import { forwardRef } from "react";
import type { FormProps } from "react-aria-components";
import { Form as AriaForm } from "react-aria-components";
import { tv } from "tailwind-variants";

const formStyles = tv({
  base: "flex flex-col gap-4"
});

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form({ className, ...props }, ref) {
  return <AriaForm ref={ref} {...props} className={formStyles({ className })} />;
});
