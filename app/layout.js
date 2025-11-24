import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "EGO ROASTER",
    description: "AI-powered brutal roast of your dating profile.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <script src="https://js.puter.com/v2/"></script>
            </head>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
