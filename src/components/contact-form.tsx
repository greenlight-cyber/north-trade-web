"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, type ReactNode } from "react";

import {
  captchaAction,
  contactLimits,
  honeypotField,
  type ContactField,
  type ContactState,
} from "@/domain/contact";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { sendContact } from "@/server/contact/actions";

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

type ContactFormProps = {
  locale: Locale;
  labels: Dictionary["form"];
  siteKey: string;
  property?: { slug: string; title: string };
};

const initialState: ContactState = { status: "idle" };

export function ContactForm({ locale, labels, siteKey, property }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(sendContact, initialState);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const statusRef = useRef<HTMLParagraphElement>(null);

  function renderCaptcha() {
    if (!captchaRef.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(captchaRef.current, {
      sitekey: siteKey,
      action: captchaAction,
      language: locale,
      theme: "light",
      size: "flexible",
    });
  }

  // Si el script ya estaba cargado (navegación dentro del sitio), se dibuja al montar.
  useEffect(() => {
    renderCaptcha();
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
    // renderCaptcha solo lee referencias y props estables del formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cada verificación sirve una sola vez: se pide una nueva solo si el servidor la usó
  // (con errores de validación o de límite, la anterior sigue siendo válida).
  useEffect(() => {
    if (state.status === "idle") return;
    const tokenUsed = state.status !== "invalid" && state.status !== "rateLimited";
    if (tokenUsed && widgetId.current) window.turnstile?.reset(widgetId.current);
    statusRef.current?.focus();
  }, [state]);

  const values = state.status === "success" ? {} : (state.values ?? {});
  const error = (field: ContactField) => {
    const code = state.errors?.[field];
    return code ? labels.errors[code] : undefined;
  };
  const statusText = state.status === "idle" ? "" : labels.status[state.status];

  return (
    <form action={formAction} noValidate className="flex flex-col">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderCaptcha}
      />
      <input type="hidden" name="lang" value={locale} />
      {property && (
        <>
          <input type="hidden" name="property" value={property.slug} />
          <p className="mb-6 border-l-2 border-seal pl-4">
            <span className="block text-xs font-medium tracking-[0.12em] text-line uppercase">
              {labels.propertyLabel}
            </span>
            <span className="font-serif text-xl">{property.title}</span>
          </p>
        </>
      )}

      {/* Trampa para robots: fuera de la vista, del teclado y de los lectores de pantalla. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Sitio web
          <input type="text" name={honeypotField} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="border-t border-line">
        <Field
          name="name"
          label={labels.name}
          error={error("name")}
          input={(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              required
              maxLength={contactLimits.name}
              defaultValue={values.name}
            />
          )}
        />
        <Field
          name="email"
          label={labels.email}
          error={error("email")}
          input={(props) => (
            <input
              {...props}
              type="email"
              autoComplete="email"
              required
              maxLength={contactLimits.email}
              defaultValue={values.email}
            />
          )}
        />
        <Field
          name="phone"
          label={labels.phone}
          hint={labels.optional}
          error={error("phone")}
          input={(props) => (
            <input
              {...props}
              type="tel"
              autoComplete="tel"
              maxLength={contactLimits.phone}
              defaultValue={values.phone}
            />
          )}
        />
        <Field
          name="message"
          label={labels.message}
          description={labels.messageHint}
          error={error("message")}
          stacked
          input={(props) => (
            <textarea
              {...props}
              rows={6}
              required
              maxLength={contactLimits.message}
              defaultValue={values.message}
              className={`${props.className} resize-y`}
            />
          )}
        />
      </div>

      <div className="mt-6">
        <p className="sr-only">{labels.captcha}</p>
        <div ref={captchaRef} className="min-h-[65px]" />
      </div>

      <p className="mt-4 text-sm text-line">{labels.privacy}</p>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex min-h-12 items-center justify-center self-start bg-seal px-8 py-3 text-sm font-semibold tracking-[0.12em] text-paper uppercase transition-colors duration-200 hover:bg-seal-dark disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? labels.sending : labels.submit}
      </button>

      <p
        ref={statusRef}
        tabIndex={-1}
        role={state.status === "success" ? "status" : "alert"}
        className={`mt-6 focus:outline-none ${statusText ? "" : "hidden"} ${
          state.status === "success"
            ? "border-l-2 border-ink pl-4"
            : "border-l-2 border-seal pl-4 text-seal"
        }`}
      >
        {statusText}
      </p>
    </form>
  );
}

type InputProps = {
  id: string;
  name: ContactField;
  className: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

type FieldProps = {
  name: ContactField;
  label: string;
  hint?: string;
  description?: string;
  error?: string;
  stacked?: boolean;
  input: (props: InputProps) => ReactNode;
};

/** Fila del formulario con la misma forma de cuadro de datos que el buscador. */
function Field({ name, label, hint, description, error, stacked, input }: FieldProps) {
  const id = `contacto-${name}`;
  const describedBy =
    [description && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={`grid border-b border-line focus-within:bg-paper-deep ${
        stacked ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center"
      }`}
    >
      <label
        htmlFor={id}
        className="pt-3 text-xs font-medium tracking-[0.12em] text-line uppercase sm:py-3"
      >
        {label}
        {hint && <span className="ml-2 tracking-normal normal-case">({hint})</span>}
      </label>
      <div className="pb-3 sm:py-1">
        {description && (
          <p id={`${id}-ayuda`} className="mb-1 text-sm text-line">
            {description}
          </p>
        )}
        {input({
          id,
          name,
          className:
            "w-full min-w-0 bg-transparent py-2 text-ink placeholder:text-line focus:outline-none aria-invalid:text-seal",
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
        })}
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-seal">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
