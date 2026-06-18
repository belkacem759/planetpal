import { CSSProperties, ReactNode } from "react";

interface ViewTransitionProps {
  children: ReactNode;
  name?: string;
}

/**
 * Compatibility shim for React's experimental `<ViewTransition>` component,
 * which is not exported from stable React (19.2). It renders its children
 * without introducing a layout box (`display: contents`) and forwards an
 * optional `name` as a CSS `view-transition-name` so the browser-native
 * View Transitions API can still target these elements.
 *
 * Note: this does not reproduce React's automatic shared-element animation
 * orchestration — to restore that, pin react/react-dom to a canary build.
 */
export function ViewTransition({ children, name }: ViewTransitionProps) {
  if (!name) {
    return <>{children}</>;
  }

  return (
    <span style={{ display: "contents", viewTransitionName: name } as CSSProperties}>
      {children}
    </span>
  );
}

export default ViewTransition;
