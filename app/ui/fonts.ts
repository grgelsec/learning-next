import { Inter, Lusitana } from "next/font/google";
//Using the next/font module downaloads all of the font files at build time and hosts them with your other static assets.
//This means when a user visists your application, there are no additional network requests for fonts which would impact performance.
export const inter = Inter({ subsets: ["latin"] });

export const lusitana = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
});
