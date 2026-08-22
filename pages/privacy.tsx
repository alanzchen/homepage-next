import TrustPage from "components/TrustPage";
import siteContent from "shared/site-content.json";

export default function Privacy() {
  return <TrustPage content={siteContent.privacy} path="/privacy" />;
}
