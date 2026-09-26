"use client";
import { useVendorStore } from "@/store/vendorStore";
import { useEffect } from "react";
// import { useVendorStore } from "@/store/vendorStore";

export default function VendorPage() {
    const { vendors, isLoading, error, fetchVendors } = useVendorStore();

    useEffect(() => {
        fetchVendors("all");
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-700 mb-4">
                Vendor List (Test)
            </h1>

            {isLoading && <p className="text-gray-500">Loading vendors...</p>}

            {error && (
                <p className="text-red-600">
                    Error: {error}
                </p>
            )}

            {!isLoading && !error && vendors.length === 0 && (
                <p className="text-gray-500">No vendors found.</p>
            )}

            {!isLoading && !error && vendors.length > 0 && (
                <ul className="space-y-2">
                    {vendors.map((v) => (
                        <li
                            key={v.id}
                            className="border rounded-lg p-3 flex justify-between items-center"
                        >
                            <span>{v.company_name}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                                {v.status}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Raw JSON, debugging ke liye */}
            <pre className="mt-6 text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
                {JSON.stringify(vendors, null, 2)}
            </pre>
        </div>
    );
}