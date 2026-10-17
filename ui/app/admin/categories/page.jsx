"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";

import CategoryHeader from "@/components/admin/categories/CategoryHeader";
import CategoryStats from "@/components/admin/categories/CategoryStats";
import CategoryFilters from "@/components/admin/categories/CategoryFilters";
import CategoryCardsView from "@/components/admin/categories/CategoryCardsView";
import CategoryTableView from "@/components/admin/categories/CategoryTableView";
import AddEditCategoryModal from "@/components/admin/categories/AddEditCategoryModal";
import DeleteCategoryModal from "@/components/admin/categories/DeleteCategoryModal";

export default function CategoriesPage() {
  const { user } = useAuthStore();
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

  // Superadmin authorization check:
  // User must be superadmin (is_superuser is true or role is admin without vendor profile)
  const isSuperAdmin = Boolean(
    user?.is_superuser || (user?.role === "admin" && !user?.company_name)
  );

  // Initial data fetch
  useEffect(() => {
    if (isSuperAdmin) {
      fetchCategories("all", "", false);
    }
  }, [fetchCategories, isSuperAdmin]);

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

  // If user is not superadmin, render access denied shield
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4 shadow-sm border border-amber-200">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-1">
          Superadmin Access Only
        </h2>
        <p className="text-xs text-zinc-500 max-w-md mb-6 leading-relaxed">
          The Category management module is strictly restricted to platform superadministrators.
          If you are a vendor, please proceed to your product catalog.
        </p>
        <Link href="/admin/dashboard">
          <Button className="h-10 px-5 rounded-xl bg-zinc-900 text-white text-xs font-semibold gap-2 shadow-sm cursor-pointer hover:bg-zinc-800">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Refresh and Add Category action */}
      <CategoryHeader
        isLoading={isLoading}
        onRefresh={() => fetchCategories(statusFilter, searchQuery, true)}
        onAddNew={() => setIsAddModalOpen(true)}
      />

      {/* 2. Error Alert (if any) */}
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
