import type { PropsWithChildren } from "react";
import React from "react";
import ReactDOM from "react-dom";
import { canUseDOM } from "exenv";

type ModalProps = PropsWithChildren<{
    isOpen: boolean;
    onRequestClose(): void;
    parentId?: string;
    floatId: string;
    stackId: string;
    removeOverscrollBehavior?: boolean;
}>;

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function createWrapperAndAddToParent(floatId: string, parentId?: string) {
    const wrapperElement = document.createElement("div");
    wrapperElement.setAttribute("id", floatId);
    wrapperElement.setAttribute("role", "dialog");

    const node = parentId ? document.getElementById(parentId) : document.body;
    if (node) node.appendChild(wrapperElement);
    return wrapperElement;
}

/**
 *
 * @param isOpen The `boolean` state which sets this component to be render or not
 * @param parentId Parent element where the `Dialog Modal` should be nested. Pass an existing html `id`, otherwise `body` will become a parent
 * @param floatId HTML `id` that will pass to `Dialog/Modal` element
 * @param stackId Which `element` that will be `fixed` position. Pass an existing html `id`
 */
export function Dialog(props: ModalProps) {
    const {
        children,
        onRequestClose,
        isOpen,
        parentId,
        floatId,
        stackId,
        removeOverscrollBehavior
    } = props;

    const [wrapperElement, setWrapperElement] = React.useState<HTMLElement | null>(null);

    useIsomorphicLayoutEffect(() => {
        if (!canUseDOM) return;
        if (!isOpen) return;
        const handler = (e: globalThis.KeyboardEvent) => {
            if (e.key === "Escape") return onRequestClose();
        };

        document.body.addEventListener("keydown", handler);
        return () => document.body.removeEventListener("keydown", handler);
    }, [isOpen, onRequestClose]);

    // It's important using `useLayoutEffect`
    // Start modal at `0` position when it show up
    useIsomorphicLayoutEffect(() => {
        if (!canUseDOM) return;
        if (!isOpen) return;

        const body = document.body;
        const originalBody = window.getComputedStyle(body).overscrollBehavior;
        const stacked = document.getElementById(stackId);
        if (!stacked) return;

        const windowScrollY = window.scrollY;

        if (removeOverscrollBehavior) {
            body.style.overscrollBehavior = "auto none";
        }

        stacked.style.position = "fixed";
        stacked.style.right = "0";
        stacked.style.left = "0";
        stacked.style.top = `${-windowScrollY}px`;

        return () => {
            if (removeOverscrollBehavior) {
                body.style.overscrollBehavior = originalBody;
            }

            stacked.style.removeProperty("position");
            stacked.style.removeProperty("top");
            stacked.style.removeProperty("right");
            stacked.style.removeProperty("left");
            stacked.style.removeProperty("height");
            window.scrollTo({ top: windowScrollY });
        };
    }, [isOpen]);

    // Create & Destroy portal
    useIsomorphicLayoutEffect(() => {
        if (!canUseDOM) return;
        if (!isOpen) return;

        let element = document.getElementById(floatId);
        let systemCreated = false;
        if (!element) {
            systemCreated = true;
            element = createWrapperAndAddToParent(floatId, parentId);
        }

        setWrapperElement(element);
        window.scrollTo({ top: 0 });

        return () => {
            if (systemCreated && element?.parentNode) {
                element.parentNode.removeChild(element);
            }
        };
    }, [isOpen]);

    if (!canUseDOM || !isOpen || !wrapperElement) return null;
    return ReactDOM.createPortal(children, wrapperElement);
}
