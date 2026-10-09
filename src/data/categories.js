// الفئات المعروضة في المتجر. ما سواها (مثل "school" القديمة) يبقى ظاهراً في لوحة الإدارة فقط حتى يُحذف.
export const STORE_CATEGORIES = ["toys", "kids"];
export const isStoreCategory = (c) => STORE_CATEGORIES.includes(c);
