"use client";

import React, { useActionState, startTransition } from "react";
import { createCategoryAction } from "../actions";

interface CategoryFormClientProps {
  allCategories: Array<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  }>;
}

export default function CategoryFormClient({ allCategories }: CategoryFormClientProps) {
  const [state, formAction, isPending] = useActionState(createCategoryAction, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => {
          formAction(formData);
        });
      }}
      className="space-y-4 text-xs font-semibold text-slate-700"
    >
      {state?.error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
          <p className="text-[11px] font-bold text-red-700">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded">
          <p className="text-[11px] font-bold text-emerald-700">Category created successfully!</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Category Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Crepe"
          className="block w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
        />
      </div>

      <div>
        <label htmlFor="parentId" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Parent Category (Optional)
        </label>
        <select
          id="parentId"
          name="parentId"
          className="block w-full rounded border border-slate-200 px-3 py-2 text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white cursor-pointer"
        >
          <option value="">None (Top-Level Category)</option>
          {allCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} {cat.parentId ? "(Child)" : "(Root)"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Category summary or specifications info..."
          className="block w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Image Card URL
        </label>
        <input
          id="image"
          name="image"
          type="text"
          placeholder="https://images.unsplash.com/photo-..."
          className="block w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="displayOrder" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Display Order
          </label>
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            defaultValue={0}
            className="block w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          />
        </div>

        <div>
          <label htmlFor="isActive" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Status
          </label>
          <select
            id="isActive"
            name="isActive"
            defaultValue="true"
            className="block w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white cursor-pointer"
          >
            <option value="true">Active (Visible)</option>
            <option value="false">Inactive (Hidden)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
      >
        {isPending ? "Creating..." : "Create Category"}
      </button>
    </form>
  );
}
