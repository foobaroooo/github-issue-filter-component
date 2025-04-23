import { forwardRef, useRef, useState } from "react";
import {
  autoUpdate,
  size,
  flip,
  useId,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useClick,
  FloatingFocusManager,
  FloatingPortal,
} from "@floating-ui/react";
import { data } from "../data";

const Item = forwardRef(({ children, active, ...rest }, ref) => {
  const id = useId();
  return (
    <div
      ref={ref}
      role="option"
      id={id}
      aria-selected={active}
      {...rest}
      style={{
        background: active ? "lightblue" : "none",
        padding: 4,
        cursor: "default",
        ...rest.style,
      }}
    >
      {children}
    </div>
  );
});

function GithubFilter() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);

  const listRef = useRef([]);

  const { refs, floatingStyles, context } = useFloating({
    whileElementsMounted: autoUpdate,
    open,
    placement: 'bottom',
    onOpenChange: setOpen,
    middleware: [
      flip({ padding: 10 }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 10,
      }),
    ],
  });

  const role = useRole(context, { role: "listbox" });
  const dismiss = useDismiss(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [role, dismiss, listNav]
  );

  function onChange(event) {
    const value = event.target.value;
    setInputValue(value);

    if (value) {
      setOpen(true);
      setActiveIndex(0);
    } else {
      setOpen(false);
    }
  }

  const items = data.filter((item) =>
    item.toLowerCase().startsWith(inputValue.toLowerCase())
  );

  return (
    <>
      <button {...getReferenceProps({
        ref: refs.setReference,
        onClick: () => setOpen(!open),
      })}>
        Filter labels
      </button>
      {open && (
        <div>
          <input
            {...getReferenceProps({
              ref: refs.setReference,
              onChange,
              value: inputValue,
              placeholder: "Filter labels",
              "aria-autocomplete": "list",
              onKeyDown(event) {
                if (
                  event.key === "Enter" &&
                  activeIndex != null &&
                  items[activeIndex]
                ) {
                  setInputValue(items[activeIndex]);
                  setActiveIndex(null);
                  setOpen(false);
                }
              },
            })}
          />
          <FloatingPortal>
            <FloatingFocusManager
              context={context}
              initialFocus={-1}
              visuallyHiddenDismiss
            >
              <div
                {...getFloatingProps({
                  ref: refs.setFloating,
                  style: {
                    ...floatingStyles,
                    background: "#eee",
                    color: "black",
                    overflowY: "auto",
                  },
                })}
              >
                {items.map((item, index) => (
                  <Item
                    key={item}
                    {...getItemProps({
                      ref(node) {
                        listRef.current[index] = node;
                      },
                      onClick() {
                        setInputValue(item);
                        setOpen(false);
                        refs.domReference.current?.focus();
                      },
                    })}
                    active={activeIndex === index}
                  >
                    {item}
                  </Item>
                ))}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        </div>
      )}
    </>
  );
}

export default GithubFilter;
