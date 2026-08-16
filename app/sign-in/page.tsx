import { getEnabledSocialProviders } from "@/lib/social-providers";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  const socialProviders = getEnabledSocialProviders();
  return <SignInForm socialProviders={socialProviders} />;
}
