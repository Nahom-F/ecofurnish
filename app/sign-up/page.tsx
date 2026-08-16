import { getEnabledSocialProviders } from "@/lib/social-providers";
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  const socialProviders = getEnabledSocialProviders();
  return <SignUpForm socialProviders={socialProviders} />;
}
