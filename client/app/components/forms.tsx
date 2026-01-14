import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState, type CSSProperties, type JSX } from "react";
import { Outlet } from "react-router";

export function InputField(props: {
  id: string;
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}) {
  return (
    <div style={props.style ?? {}}>
      <label htmlFor={props.id} className="text-sm text-stone-500">
        {props.label}
      </label>
      <div
        className={`flex mt-2 items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 sm:text-sm/6 outline-stone-300 focus-within:outline-stone-600 border border-stone-300 h-10`}
      >
        <input
          className={`block min-w-0 grow bg-white py-1.5 pr-3 text-base focus:outline-none sm:text-sm/6`}
          id={props.id}
          type={props.type || "text"}
          name={props.name}
          autoComplete={props.autoComplete}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
        />
      </div>
    </div>
  );
}

export function CheckboxField(props: {
  id: string;
  label: string;
  name: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}) {
  return (
    <div className="flex items-center" style={props.style ?? {}}>
      <input
        id={props.id}
        name={props.name}
        type="checkbox"
        checked={props.checked}
        onChange={props.onChange}
        className={`h-4 w-4 rounded form-checkbox accent-stone-600 focus:ring-stone-600 `}
        style={{ ...props.style }}
      />
      <label htmlFor={props.id} className={`ml-2 block text-sm `}>
        {props.label}
      </label>
    </div>
  );
}

export function SelectField(props: {
  id: string;
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: CSSProperties;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" style={props.style ?? {}}>
      <label htmlFor={props.id}>{props.label}</label>
      <div style={{ display: "none" }}>
        <select
          id={props.id}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          className=""
        >
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`block cursor-pointer w-full rounded-md border border-stone-300 px-3 py-2 h-10 text-base text-stone-900 relative focus:outline-2 focus:-outline-offset-2 focus:outline-stone-600`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="inline-block">{props.value}</span>
        <ChevronDownIcon
          className={`absolute size-5 text-stone-600 ml-2 top-2 right-2`}
        />
      </div>
      <div
        className={`${
          isOpen ? "" : "hidden"
        } border border-stone-300 rounded-md mt-1 bg-white z-10 absolute max-h-60 overflow-y-auto w-full`}
      >
        <ul className={`m-0 p-0 list-none`}>
          {props.options.map((option) => (
            <li
              key={option.value}
              className={`w-full p-2 hover:bg-stone-100 cursor-pointer`}
              onClick={() => {
                props.onChange &&
                  props.onChange({
                    target: {
                      value: option.value,
                    },
                  } as React.ChangeEvent<HTMLSelectElement>);
                setIsOpen(false);
              }}
            >
              {option.value} - {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TextAreaField(props: {
  id: string;
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={props.id}>{props.label}</label>
      <div className="mt-3">
        <textarea
          id={props.id}
          name={props.name}
          rows={props.rows || 4}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-stone-900 outline-stone-300 outline-1 outline-offset-1 placeholder:text-stone-400 focus:outline-2 focus:-outline-offset-2 focus:outline-stone-600 sm:text-sm/6`}
        ></textarea>
      </div>
    </div>
  );
}

export function RadioField(props: {
  label: string;
  id: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center">
      <input
        id={props.id}
        name={props.name}
        type="radio"
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
        className={`h-4 w-4 form-radio accent-stone-600 focus:ring-stone-600 `}
      />
      <label htmlFor={props.id} className={`ml-2 block text-sm text-stone-900`}>
        {props.label}
      </label>
    </div>
  );
}

export function SubmitButton(props: {
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="submit"
      disabled={props.disabled}
      onClick={props.onClick}
      className={`rounded-md bg-stone-700 hover:bg-stone-900 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-95 duration-150 transition-all flex justify-center items-center`}
      style={{ ...props.style }}
    >
      <div className="flex items-center gap-2">
        {props.icon && (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            {props.icon}
          </span>
        )}
        {props.label}
      </div>
    </button>
  );
}
export function ActionButton(props: {
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      className={`rounded-md bg-white px-3 py-1 text-sm font-semibold text-stone-900 hover:bg-stone-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border border-stone-300 active:scale-95  duration-150 transition-all `}
      style={{ ...props.style }}
    >
      <div className="flex items-center gap-2">
        {props.icon && (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            {props.icon}
          </span>
        )}
        {props.label}
      </div>
    </button>
  );
}

export function CancelButton(props: {
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      className={`rounded-md bg-red-700 px-3 py-1 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-95 transition-all duration-150 `}
    >
      <div className="flex items-center gap-2">
        {props.icon && (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            {props.icon}
          </span>
        )}
        <span style={{}}>{props.label}</span>
      </div>
    </button>
  );
}
