import { site } from "@/site/lib/ctx";

export async function Pager({
  base,
  page,
  pages,
  query: qs,
}: {
  base: string;
  page: number;
  pages: number;
  query: string;
}) {
  if (pages < 2) return null;
  const s = await site();
  const href = (n: number) => `${base}${n > 1 ? `/page:${n}` : ""}${qs ? `?${qs}` : ""}`;
  let start = Math.max(1, page - 4);
  const end = Math.min(pages, start + 8);
  start = Math.max(1, end - 8);
  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);
  const arrow = (
    <svg width="10" height="10">
      <use href="#i-arrow-sm"></use>
    </svg>
  );
  return (
    <ul className="ams-pager">
      {page > 1 && (
        <li className="ams-pager-prev">
          <a href={href(page - 1)} aria-label={s.t("general_text_53")} rel="prev">
            {arrow}
          </a>
        </li>
      )}
      {nums.map((n) =>
        n === page ? (
          <li key={n} className="active">
            <span>{n}</span>
          </li>
        ) : (
          <li key={n}>
            <a href={href(n)}>{n}</a>
          </li>
        ),
      )}
      {page < pages && (
        <li className="next">
          <a href={href(page + 1)} aria-label={s.t("general_text_54")} rel="next">
            {arrow}
          </a>
        </li>
      )}
    </ul>
  );
}
