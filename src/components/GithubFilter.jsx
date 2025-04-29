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

const Item = forwardRef(({ active, ...rest }, ref) => {
  const id = useId();
  return (
    <div
      className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${active ? 'bg-blue-50' : ''}`}
      ref={ref} 
      role="option"
      id={id}
      aria-selected={active}
      {...rest}
    />
  );
});

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

  const items = data.filter((item) => {
    return item.login.toLowerCase().startsWith(inputValue.toLowerCase());
  });

  return (
    <>
      <button 
        tabIndex={0}
        ref={refs.setReference}
        className="w-40 h-8 border border-gray-300 rounded-md px-2 flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...getReferenceProps()}
        onClick={() => setOpen(!open)}
      >
        {children}
        <span>
          <FaAngleDown className={`transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      
      <FloatingPortal>
        {open && (
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="bg-white shadow-lg rounded-md border border-gray-200 w-64"
              {...getFloatingProps()}
            >
              <div className="p-2 border-b border-gray-200 flex items-center">
                <input
                  type="text"
                  placeholder={placeHolder}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={inputValue}
                  onChange={onChange}
                  aria-label="Filter input"
                />
                <button 
                  onClick={() => setOpen(false)} 
                  className="ml-2 p-1 hover:bg-gray-100 rounded-md"
                  aria-label="Close filter"
                >
                  <MdClose className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div
                role="listbox"
                className="py-1 max-h-60 overflow-y-auto"
              >
                {items.map((item, index) => (
                  <Item
                    key={item.id}
                    {...getItemProps({
                      ref(node) {
                        listRef.current[index] = node;
                      },
                      onClick() {
                        setOpen(false);
                      }
                    })}
                    active={activeIndex === index}
                  >
                    {renderItem(item)}
                  </Item>
                ))}
              </div>
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
}

export default GithubFilter;
