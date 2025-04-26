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
import { FaAngleDown } from "react-icons/fa6";
import { MdClose } from "react-icons/md";

const Item = ({ children, active, ...rest }, ref) => {
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
        padding: "5px 15px",
        cursor: "default",
        ...rest.style,
      }}
    >
      {children}
    </div>
  );
};

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
    return item.login.toLowerCase().startsWith(inputValue.toLowerCase())
  });

  return (
    <>
      <button 
        tabIndex={0}
        ref={refs.setReference}
        style={{ width: 150, lineHeight: 2 }}
        {...getReferenceProps({ 
          onClick: () => setOpen(!open),
        })}
      >
        {children}
        <span>
          <FaAngleDown />
        </span>
      </button>
      {open && (
        <div
          ref={refs.setFloating}
          // style={floatingStyles}
          className="bg-white border border-gray-200 shadow-md text-xs w-64 flex flex-col rounded-lg"
        >
          <div className="m-2 pl-1 font-semibold flex items-center">
            <button onClick={() => setOpen(false)} className="ml-auto px-1 ">
              <MdClose className="w-4 h-4" />
            </button>
          </div>
          <hr />
          <input
            {...getReferenceProps({
              ref: refs.setReference,
              onChange,
              value: inputValue,
              placeholder: placeHolder,
//              "aria-autocomplete": "list",
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
          <hr />
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
                     className="overflow-auto h-64 flex flex-col"
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
                    <div className="flex items-center gap-2">
                      <img 
                        src={item.avatar_url} 
                        alt={`${item.login}'s avatar`}
                        className="w-1 h-4 rounded-lg border border-gray-300"
                      />
                      {item.login}
                    </div>
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
