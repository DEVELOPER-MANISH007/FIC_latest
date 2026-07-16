import { useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "@/utils/cn";

interface BaseProps {
  label: string;
  error?: string;
  optional?: boolean;
}

type InputFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: "input" };
type TextareaFieldProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: "textarea" };
type SelectFieldProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { as: "select"; children: ReactNode };

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

/**
 * Unified form field used across the Admission and Contact forms —
 * reproduces the original .field / .f-label styling and renders an
 * inline validation message when `error` is set.
 */
const FormField = (props: FormFieldProps) => {
  const { label, error, optional, id, as, children, ...rest } = props as FormFieldProps & {
    as?: string;
    children?: ReactNode;
  };
  const { type, ...inputRest } = rest as InputHTMLAttributes<HTMLInputElement>;
  const typeValue = type || "text";
  const isPassword = (as === undefined || as === "input") && typeValue === "password";
  const [isVisible, setIsVisible] = useState(false);
  const inputType = isPassword ? (isVisible ? "text" : "password") : typeValue;

  return (
    <div className="relative">
      <label className="f-label" htmlFor={id}>
        {label} {optional && <span className="font-normal text-[var(--ink-soft)]">(Optional)</span>}
      </label>

      {as === "textarea" && (
        <textarea
          id={id}
          className={cn("field", error && "field-error")}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      )}

      {as === "select" && (
        <select id={id} className={cn("field", error && "field-error")} {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}>
          {children}
        </select>
      )}

      {(!as || as === "input") && (
        <>
          <input
            id={id}
            className={cn("field pr-12", error && "field-error")}
            type={inputType}
            {...(inputRest as InputHTMLAttributes<HTMLInputElement>)}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setIsVisible((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          )}
        </>
      )}

      {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
