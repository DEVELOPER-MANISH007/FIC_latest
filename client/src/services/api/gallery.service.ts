import api from "./axiosInstance";
import type { ApiResponse, GalleryItem } from "@/types";

export const fetchGallery = async (): Promise<GalleryItem[]> => {
  const { data } = await api.get<ApiResponse<GalleryItem[]>>("/gallery");
  return data.data || [];
};

