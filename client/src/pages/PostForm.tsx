import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPost, getPost, updatePost } from "../api/posts";
import { ErrorMessage, Loading } from "../components/Status";
import { UserSearch } from "../components/UserSearch";
import { useStore } from "../store";
import type { PostInput } from "../types";
import { DEMO_NOTE, isLocalOnly } from "../usePostActions";

const empty: PostInput = { userId: 1, title: "", body: "" };

export function PostForm() {
  const params = useParams();
  const editId = params.id ? Number(params.id) : undefined;
  const navigate = useNavigate();
  const { findLocal, addCreated, saveEdited, setNotice } = useStore();

  const [values, setValues] = useState<PostInput>(empty);
  const [loadError, setLoadError] = useState<Error>();
  const [loading, setLoading] = useState(editId !== undefined);
  const [submitError, setSubmitError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId === undefined) return;
    const local = findLocal(editId);
    const load = local ? Promise.resolve(local) : getPost(editId);
    load
      .then(({ userId, title, body }) => setValues({ userId, title, body }))
      .catch(setLoadError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const input = { ...values, title: values.title.trim(), body: values.body.trim() };
    if (!input.title || !input.body) {
      setSubmitError("Title and body are required.");
      return;
    }
    setSaving(true);
    setSubmitError(undefined);
    try {
      if (editId === undefined) {
        const post = addCreated(await createPost(input));
        setNotice(`Created post #${post.id} ${DEMO_NOTE}`);
        navigate(`/posts/${post.id}`);
      } else {
        const post = isLocalOnly(editId) ? { id: editId, ...input } : await updatePost(editId, input);
        saveEdited({ ...post, id: editId });
        setNotice(`Saved post #${editId} ${DEMO_NOTE}`);
        navigate(`/posts/${editId}`);
      }
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <ErrorMessage error={loadError} />;
  if (loading) return <Loading />;

  return (
    <form className="card form" onSubmit={onSubmit}>
      <h1>{editId === undefined ? "New post" : `Edit post #${editId}`}</h1>
      <label>
        User
        <UserSearch
          value={values.userId}
          onChange={(id) => id !== undefined && setValues((v) => ({ ...v, userId: id }))}
          required
        />
      </label>
      <label>
        Title
        <input value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} required />
      </label>
      <label>
        Body
        <textarea
          rows={6}
          value={values.body}
          onChange={(e) => setValues({ ...values, body: e.target.value })}
          required
        />
      </label>
      {submitError && <p className="error">{submitError}</p>}
      <div className="actions">
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className="secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
