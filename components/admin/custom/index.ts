import type { ComponentType } from "react";
import { ContactContent } from "./contact-content";
import { CommentReplies, CommentReply } from "./comment-reply";
import { CustomerOrders, CustomerWishlist } from "./customer-orders";
import { AccountRoles } from "./account-roles";
import { FilterItems } from "./filter-items";
import { ProductVariants } from "./product-variants";
import { ProductFilters } from "./product-filters";
import { ProductRating } from "./product-rating";
import { NewsTags } from "./news-tags";

export const customFields: Record<string, ComponentType<any>> = {
  "account-roles": AccountRoles,
  "contact-content": ContactContent,
  "comment-replies": CommentReplies,
  "comment-reply": CommentReply,
  "customer-orders": CustomerOrders,
  "customer-wishlist": CustomerWishlist,
  "filter-items": FilterItems,
  "product-variants": ProductVariants,
  "product-filters": ProductFilters,
  "product-rating": ProductRating,
  "news-tags": NewsTags,
};
