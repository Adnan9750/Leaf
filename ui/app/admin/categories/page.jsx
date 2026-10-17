"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useCategoryStore } from "@/store/categoryStore";

import CategoryHeader from "@/components/admin/categories/CategoryHeader";
import CategoryStats from "@/components/admin/categories/CategoryStats";
import CategoryFilters from "@/components/admin/categories/CategoryFilters";
import CategoryCardsView from "@/components/admin/categories/CategoryCardsView";
import CategoryTableView from "@/components/admin/categories/CategoryTableView";
import AddEditCategoryModal from "@/components/admin/categories/AddEditCategoryModal";
import DeleteCategoryModal from "@/components/admin/categories/DeleteCategoryModal";

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    fetchCategories,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory,
  } = useCategoryStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // Initial data fetch - backend validates whether the requesting user is a superadmin
  useEffect(() => {
    fetchCategories("all", "", false);
  }, [fetchCategories]);

  // Dynamic Metrics & Stats Calculation
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.is_active).length;
    const inactive = categories.filter((c) => !c.is_active).length;

    let latestName = "";
    let latestDate = "";
    if (categories.length > 0) {
      const sorted = [...categories].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      latestName = sorted[0]?.name || "";
      if (sorted[0]?.created_at) {
        latestDate = new Date(sorted[0].created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }

    return { total, active, inactive, latestName, latestDate };
  }, [categories]);

  // Filtered Categories based on search query and status filter
  const displayCategories = useMemo(() => {
    let list = categories;

    if (statusFilter === "active") {
      list = list.filter((c) => c.is_active);
    } else if (statusFilter === "inactive") {
      list = list.filter((c) => !c.is_active);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.slug || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [categories, statusFilter, searchQuery]);

  // Handler: Create Category
  const handleCreateCategory = async (payload) => {
    setIsModalSubmitting(true);
    const res = await createCategory(payload);
    setIsModalSubmitting(false);
    if (res.success) {
      setIsAddModalOpen(false);
    }
    return res;
  };

  // Handler: Update Category
  const handleUpdateCategory = async (payload) => {
    if (!editingCategory) return;
    setIsModalSubmitting(true);
    const res = await updateCategory(editingCategory.id, payload);
    setIsModalSubmitting(false);
    if (res.success) {
      setEditingCategory(null);
    }
    return res;
  };

  // Handler: Toggle Active / Inactive
  const handleToggleStatus = async (id, currentStatus) => {
    setUpdatingId(id);
    await toggleCategoryStatus(id, currentStatus);
    setUpdatingId(null);
  };

  // Handler: Confirm Delete
  const handleConfirmDelete = async (id) => {
    setIsModalSubmitting(true);
    await deleteCategory(id);
    setIsModalSubmitting(false);
    setDeletingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Refresh and Add Category action */}
      <CategoryHeader
        isLoading={isLoading}
        onRefresh={() => fetchCategories(statusFilter, searchQuery, true)}
        onAddNew={() => setIsAddModalOpen(true)}
      />

      {/* 2. Error Alert (Displays backend permission or fetch errors) */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchCategories("all", "", true)}
            className="text-xs font-bold text-red-700 underline hover:text-red-900 cursor-pointer ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Metric Stats Row */}
      <CategoryStats stats={stats} />

      {/* 4. Controls: Status Tabs, View Switcher (Cards/Table), Search Bar */}
      <CategoryFilters
        filter={statusFilter}
        setFilter={setStatusFilter}
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalCount={displayCategories.length}
      />

      {/* 5. Content View: Cards View or Table View */}
      {viewMode === "cards" ? (
        <CategoryCardsView
          categories={displayCategories}
          onEdit={(cat) => setEditingCategory(cat)}
          onDelete={(cat) => setDeletingCategory(cat)}
          onToggleStatus={handleToggleStatus}
          onAddNew={() => setIsAddModalOpen(true)}
          updatingId={updatingId}
        />
      ) : (
        <CategoryTableView
          categories={displayCategories}
          onEdit={(cat) => setEditingCategory(cat)}
          onDelete={(cat) => setDeletingCategory(cat)}
          onToggleStatus={handleToggleStatus}
          onAddNew={() => setIsAddModalOpen(true)}
          updatingId={updatingId}
        />
      )}

      {/* 6. Modal: Add Category */}
      <AddEditCategoryModal
        isOpen={isAddModalOpen}
        category={null}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateCategory}
        isSubmitting={isModalSubmitting}
      />

      {/* 7. Modal: Edit Category */}
      <AddEditCategoryModal
        isOpen={Boolean(editingCategory)}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdateCategory}
        isSubmitting={isModalSubmitting}
      />

      {/* 8. Modal: Delete Category Confirmation */}
      <DeleteCategoryModal
        isOpen={Boolean(deletingCategory)}
        category={deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        isSubmitting={isModalSubmitting}
      />
    </div>
  );
}
