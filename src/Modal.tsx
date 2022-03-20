import type { CSSProperties, PropsWithChildren } from "react";
import React from "react";
import ReactDOM from "react-dom";

 const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function createWrapperAndAppendToBody(wrapperID: string, boundID: string) {
    const wrapperElement = document.createElement("div");
    wrapperElement.setAttribute("id", wrapperID);
    const next = document.getElementById(boundID);
    if (next) {
        next.appendChild(wrapperElement);
    }
    return wrapperElement;
}

type ModalProps = PropsWithChildren<{
    isOpen: boolean;
    onRequestClose(): void;
    style?: CSSProperties;
    className?: string;
    boundID: string;
    portalID: string;
    willFixID: string;
}>;

export default function Modal(props: ModalProps) {
    const { children, onRequestClose, isOpen, style, className, boundID, portalID, willFixID } =
        props;

    const [wrapperElement, setWrapperElement] = React.useState<HTMLElement | null>(null);

    useIsomorphicLayoutEffect(() => {
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
        if (!isOpen) return;

        const body = document.body;
        const originalBody = window.getComputedStyle(body).overscrollBehavior;
        const main = document.getElementById(willFixID);
        if (!main) return;

        const windowScrollY = window.scrollY;

        body.style.overscrollBehavior = "auto none";

        main.style.position = "fixed";
        main.style.right = "0";
        main.style.left = "0";
        main.style.top = `${-windowScrollY}px`;

        return () => {
            body.style.overscrollBehavior = originalBody;
            main.style.removeProperty("position");
            main.style.removeProperty("top");
            main.style.removeProperty("right");
            main.style.removeProperty("left");
            main.style.removeProperty("height");
            window.scrollTo({ top: windowScrollY });
        };
    }, [isOpen]);

    // Create/Destroy portal
    useIsomorphicLayoutEffect(() => {
        if (!isOpen) return;

        let element = document.getElementById(portalID);
        let systemCreated = false;
        if (!element) {
            systemCreated = true;
            element = createWrapperAndAppendToBody(portalID, boundID);
        }

        if (className) {
            element.classList.add(className);
        }
        if (style) {
            console.log(style);
        }

        element.setAttribute("role", "dialog");

        setWrapperElement(element);
        window.scrollTo({ top: 0 });

        return () => {
            if (systemCreated && element?.parentNode) {
                element.parentNode.removeChild(element);
            }
        };
    }, [isOpen]);

    if (!isOpen || !wrapperElement) return null;
    return ReactDOM.createPortal(
        <>
            <button
                    onClick={onRequestClose}
                    name="Exit"
                    title="Exit"
                    style={{
                        appearance: "none",
                        background: "none",
                        border: "1px solid",
                        borderRadius: "100%",
                        padding: 0,
                        margin: 0,
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        fontWeight: "bold",
                        cursor: "pointer",
                        aspectRatio: "1/1",
                        width: "1.3em",
                        height: "1.3em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "absolute",
                        top: "1em",
                        left: "1em"
                    }}
                >
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%"
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="1.3em"
                            width="1.3em"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M0 0h24v24H0V0z" fill="none" />
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                    </span>
                </button>
            {children}
        </>,
        wrapperElement
    );
}
