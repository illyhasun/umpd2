import Header from "@/components/ui/header"
import "./globals.css"

export const metadata = {
  title: "UPMD",
};


export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
