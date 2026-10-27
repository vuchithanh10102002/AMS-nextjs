import { Adm } from "@/site/components/adm";
import { Shell } from "@/site/components/shell";
import { site } from "@/site/lib/ctx";
import { src } from "@/site/lib/data";

export async function Page404() {
  const s = await site();
  return (
    <Shell here={{}}>
      <div className="page-404 text-center" style={{ padding: "200px 0" }}>
        <p className="text-center">
          <img
            src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
            className="lazy"
            data-src={src(s.t("general_text_99"))}
            alt="Image"
            style={{ width: "auto", height: "auto", margin: "0 auto" }}
          />
          <Adm m="lang" v="general_text_99" mode="image" />
        </p>
      </div>
    </Shell>
  );
}
