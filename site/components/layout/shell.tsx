import { Footer } from "./footer";
import { Header, type Here } from "./header";

export function Shell({ here, children }: { here: Here; children: React.ReactNode }) {
  return (
    <>
      <Header here={here} />
      {children}
      <Footer here={here} />
    </>
  );
}
