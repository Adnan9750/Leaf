import axiosInstance from "@/utils/axiosInstance";

export const adminApi = {
  /**
   * Fetch all vendors or filter by status ('pending', 'approved', 'rejected')
   */
  listVendors: async (status) => {
    const params = {};
    if (status && status !== "all") {
      params.status = status;
    }
    const res = await axiosInstance.get("/auth/vendors", { params });
    return res.data;
  },

  /**
   * Update vendor status ('pending', 'approved', 'rejected')
   */
  updateVendorStatus: async (vendorId, { status, rejection_reason }) => {
    const res = await axiosInstance.patch(`/auth/vendors/${vendorId}/status`, {
      status,
      rejection_reason,
    });
    return res.data;
  },
};

export default adminApi;
