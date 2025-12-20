import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#EAB308",
          colorBackground: "#0A0A0A",
          colorInputBackground: "#171717",
          colorInputText: "#FAFAFA",
          colorText: "#FAFAFA",
          colorTextSecondary: "#A1A1AA",
          colorDanger: "#EF4444",
          colorSuccess: "#22C55E",
          borderRadius: "0.75rem",
          fontFamily: "Inter, system-ui, sans-serif",
        },
        elements: {
          card: {
            backgroundColor: "#171717",
            border: "1px solid #262626",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          },
          headerTitle: {
            fontWeight: "800",
            letterSpacing: "0.025em",
          },
          headerSubtitle: {
            color: "#A1A1AA",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#262626",
            border: "1px solid #404040",
            "&:hover": {
              backgroundColor: "#333333",
            },
          },
          formButtonPrimary: {
            backgroundColor: "#EAB308",
            color: "#0A0A0A",
            fontWeight: "700",
            "&:hover": {
              backgroundColor: "#CA8A04",
            },
          },
          footerActionLink: {
            color: "#EAB308",
            fontWeight: "600",
            "&:hover": {
              color: "#FDE047",
            },
          },
          identityPreviewEditButton: {
            color: "#EAB308",
          },
          formFieldInput: {
            backgroundColor: "#0A0A0A",
            border: "1px solid #262626",
            "&:focus": {
              borderColor: "#EAB308",
              boxShadow: "0 0 0 2px rgba(234, 179, 8, 0.2)",
            },
          },
          dividerLine: {
            backgroundColor: "#262626",
          },
          dividerText: {
            color: "#71717A",
          },
          userButtonPopoverCard: {
            backgroundColor: "#171717",
            border: "1px solid #262626",
          },
          userButtonPopoverActionButton: {
            "&:hover": {
              backgroundColor: "#262626",
            },
          },
          userButtonPopoverActionButtonText: {
            color: "#FAFAFA",
          },
          userButtonPopoverFooter: {
            display: "none",
          },
          footerAction: {
            display: "none",
          },
          signUp: {
            display: "none",
          },
        },
        signIn: {
          variables: {
            colorPrimary: "#EAB308",
          },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
