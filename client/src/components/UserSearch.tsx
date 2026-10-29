import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { getUser, searchUsers } from "../api/users";
import type { User } from "../types";

const DEBOUNCE_MS = 250;

interface Props {
  /** Selected user id, or undefined for none. */
  value?: number;
  onChange(userId: number | undefined): void;
  placeholder?: string;
  /** Show a clear button that resets the selection to undefined. */
  allowClear?: boolean;
  required?: boolean;
  "aria-label"?: string;
}

/** Text input that searches users on the server as you type and lets you pick one. */
export function UserSearch({ value, onChange, placeholder = "Search users…", allowClear, required, ...rest }: Props) {
  const listId = useId();
  const [selected, setSelected] = useState<User>();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string>();
  const [active, setActive] = useState(-1);
  const editing = useRef(false);

  // Resolve the selected id to a user (on first render, after reload, or when the parent changes it).
  useEffect(() => {
    if (value === undefined) {
      setSelected(undefined);
      if (!editing.current) setText("");
      return;
    }
    if (selected?.id === value) return;
    let cancelled = false;
    getUser(value).then(
      (user) => {
        if (cancelled) return;
        setSelected(user);
        if (!editing.current) setText(user.name);
      },
      () => {
        if (!cancelled && !editing.current) setText(`User ${value}`);
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Debounced server search while the list is open.
  const query = text.trim();
  useEffect(() => {
    if (!open || !query) {
      setResults([]);
      setSearching(false);
      setError(undefined);
      return;
    }
    const controller = new AbortController();
    // Drop the previous query's results so Enter can't pick a hidden, stale user.
    setResults([]);
    setActive(-1);
    setSearching(true);
    const timer = setTimeout(() => {
      searchUsers(query, controller.signal).then(
        (users) => {
          setResults(users);
          setActive(users.length ? 0 : -1);
          setError(undefined);
          setSearching(false);
        },
        (err: Error) => {
          if (controller.signal.aborted) return;
          setResults([]);
          setError(err.message);
          setSearching(false);
        },
      );
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  function pick(user: User) {
    editing.current = false;
    setSelected(user);
    setText(user.name);
    setOpen(false);
    onChange(user.id);
  }

  function clear() {
    editing.current = false;
    setSelected(undefined);
    setText("");
    setOpen(false);
    onChange(undefined);
  }

  /** Leaving the field without picking restores the current selection's name. */
  function revert() {
    editing.current = false;
    setOpen(false);
    setText(selected?.name ?? "");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && !searching && results[active]) {
        e.preventDefault();
        pick(results[active]);
      }
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      revert();
    }
  }

  const showList = open && query.length > 0;
  const activeId = showList && results[active] ? `${listId}-${results[active].id}` : undefined;

  return (
    <div className="user-search">
      <div className="user-search-field">
        <input
          type="text"
          role="combobox"
          aria-label={rest["aria-label"]}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          placeholder={placeholder}
          required={required}
          value={text}
          onChange={(e) => {
            editing.current = true;
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={(e) => e.target.select()}
          onBlur={revert}
          onKeyDown={onKeyDown}
        />
        {allowClear && (value !== undefined || text) && (
          <button
            type="button"
            className="link user-search-clear"
            aria-label="Clear user"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
          >
            ×
          </button>
        )}
      </div>
      {showList && (
        <ul className="user-search-results" id={listId} role="listbox">
          {searching && <li className="muted">Searching…</li>}
          {!searching && error && <li className="error">{error}</li>}
          {!searching && !error && results.length === 0 && <li className="muted">No users found</li>}
          {!searching &&
            results.map((u, i) => (
              <li
                key={u.id}
                id={`${listId}-${u.id}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : undefined}
                // mousedown fires before the input's blur, so the pick wins.
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(u);
                }}
                onMouseEnter={() => setActive(i)}
              >
                {u.name} <span className="muted">@{u.username}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
