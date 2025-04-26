import { forwardRef, useRef, useState } from "react";
import {
  autoUpdate,
  size,
  flip,
  offset,
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

function GithubFilter({ data, placeHolder, children }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const listRef = useRef([]);
  
  const { refs, floatingStyles, context } = useFloating({
    whileElementsMounted: autoUpdate,
    open: open,
    placement: 'bottom',
    onOpenChange: setOpen,
    middleware: [
      offset(5),
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

  //console.log('GithubFilter data', data);

  const items = (data).filter((item) => {
    console.log('inputValue', inputValue);
    return item.login.toLowerCase().startsWith(inputValue.toLowerCase())
  });

  return (
    <>
      <button 
        tabIndex={0}
        ref={refs.setReference}
        aria-labelledby="select-label"
        aria-autocomplete="none"
        style={{ width: 150, lineHeight: 2, margin: "auto" }}
        {...getReferenceProps({
          onClick: () => setOpen(!open),
        })}
      >
        {children}
      </button>
      {open && (
        <div style={{floatingStyles}} ref={refs.setFloating}>
          <input
            {...getReferenceProps({
              ref: refs.setReference,
              onChange,
              value: inputValue,
              placeholder: placeHolder,
              "aria-autocomplete": "list",
              onKeyDown(event) {
                if (
                  event.key === "Enter" &&
                  activeIndex != null &&
                  items[activeIndex]
                ) {
                  setInputValue(items[activeIndex].login);
                  setActiveIndex(null);
                  setOpen(false);
                }
              },
            })
          }
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
                    key={item.login}
                    {...getItemProps({
                      ref(node) {
                        listRef.current[index] = node;
                      },
                      onClick() {
                        setInputValue(item.login);
                        setOpen(false);
                        refs.domReference.current?.focus();
                      },
                    })}
                    active={activeIndex === index}
                  >
                    {item.login}
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
