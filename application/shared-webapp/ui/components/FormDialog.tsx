/**
 * @see ./AlertDialog.tsx
 */
import { AlertCircleIcon, InfoIcon, XIcon } from "lucide-react";
import { useCallback, useId, useRef, type ReactNode } from "react";
import { chain } from "react-aria";
import type { DialogProps, FormProps } from "react-aria-components";
import { tv } from "tailwind-variants";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Form } from "./Form";
import { Heading } from "./Heading";

interface FormDialogProps extends Omit<DialogProps, "children" | "isDismissable"> {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "info" | "destructive";
  actionLabel: string;
  cancelLabel?: string;
  action?: (formData: FormData) => void;
  validationErrors?: FormProps["validationErrors"];
  onOpenChange: (isOpen: boolean) => void;
  onAction?: () => void;
}

const formDialogContents = tv({
  base: "w-6 h-6 absolute right-6 top-6 stroke-2",
  variants: {
    variant: {
      neutral: "hidden",
      destructive: "text-destructive",
      info: "text-primary"
    }
  },
  defaultVariants: {
    variant: "neutral"
  }
});

export function FormDialog({
  title,
  description,
  variant,
  cancelLabel,
  actionLabel,
  action,
  validationErrors,
  onAction,
  onOpenChange,
  children,
  ...props
}: Readonly<FormDialogProps>) {
  const contentId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(() => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }, []);

  return (
    <Dialog role="alertdialog" aria-describedby={contentId} {...props}>
      {({ close }) => (
        <>
          <Heading slot="title">{title}</Heading>
          <div className={formDialogContents({ variant })}>
            {variant === "destructive" ? <AlertCircleIcon aria-hidden /> : <InfoIcon aria-hidden />}
          </div>
          <div id={contentId} className="mt-3 text-muted-foreground">
            <Button
              onPress={() => onOpenChange(false)}
              className="absolute top-0 right-0 m-3"
              variant="ghost"
              size="sm"
            >
              <XIcon className="w-4 h-4" />
            </Button>
            <div className="flex flex-col text-foreground text-xl font-semibold">
              <div className="pb-4">
                <h2 className="text-muted-foreground text-sm font-normal">{description}</h2>
              </div>
              <Form
                ref={formRef}
                action={action}
                validationErrors={validationErrors}
                className="w-full flex-col flex gap-3 text-muted-foreground text-sm font-medium"
              >
                {children}
              </Form>
            </div>
          </div>
          <div role="group" className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onPress={close}>
              {cancelLabel ?? "Cancel"}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "primary"}
              autoFocus
              onPress={chain(handleSubmit, onAction)}
            >
              {actionLabel}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
