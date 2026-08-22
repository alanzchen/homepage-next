import TrustPage from "components/TrustPage";
import siteContent from "shared/site-content.json";

export default function Contact() {
  return <TrustPage content={siteContent.contact} path="/contact" />;
}
