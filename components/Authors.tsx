import { ArticleAuthor } from "../models/UserArticle.ts";

// Look up Readup's implementation?
export default (authors: { name?: string; slug?: string; url?: string }[]) =>
  authors.filter((a) => !!a.name).map((a) => a.name).join(", ");
