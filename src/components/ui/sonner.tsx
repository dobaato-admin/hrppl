import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      // Top-right, not sonner's bottom-right default. The clock widget is a
      // fixed element in the bottom-right corner, so the default stacked toasts
      // directly on top of it — and the toast that appears right after a punch
      // is precisely when you next want to touch the widget.
      position="top-right"
      // Sonner's default is 4s; long enough to be in the way, short enough to
      // miss. Success messages here are confirmations you have already seen the
      // result of, so they get less. Errors override this per-call.
      duration={3000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
