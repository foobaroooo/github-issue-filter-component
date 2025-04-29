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

const Item = ({ active, ...rest }, ref) => {
  const id = useId();
  return (
    <div
      className={`border-b border-gray-200 px-6 py-2 w-full ${active ? 'bg-blue-100' : ''}`}
      ref={ref} 
      role="option"
      id={id}
      aria-selected={active}
      {...rest}
    >
    </div>
  );
};

function GithubFilter({ data, placeHolder, renderItem, children }) {
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
        className="w-40 h-8 border border-gray-300 rounded-lg px-2 flex items-center justify-between"
        {...getReferenceProps()}
        onClick={() => setOpen(!open)}
      >
        {children}
        <span>
          <FaAngleDown className={`transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles} 
          className="bg-[#eee] shadow-lg text-xs w-64 flex flex-col rounded-lg"
          {...getFloatingProps()}
        >
          <div className="m-2 pl-1 font-semibold flex items-center">
            <button onClick={() => setOpen(false)} className="ml-auto px-1 ">
              <MdClose className="w-4 h-4" />
            </button>
          </div>

          <hr />
          
          <input
            type="text"
            placeholder={placeHolder}
            className="m-2 p-2 border border-gray-300 rounded-lg"
            value={inputValue}
            onChange={(e) => onChange(e)}
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
                    top: "80px",
                  },
                })}
              >
                {items.map((item, index) => (
                  <Item
                    key={item.id}
                    {...getItemProps({
                      ref(node) {
                        listRef.current[index] = node;
                      }
                    })}
                    active={activeIndex === index}
                  >
                    {renderItem(item)}
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
