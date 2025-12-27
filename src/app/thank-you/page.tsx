import ThankYouClient from "./thank-you-client";


export const dynamic = "force-dynamic"; // ✅ prerender muammosini to'xtatadi

type Props = {
  searchParams?: {
    name?: string;
  };
};

export default function ThankYouPage({ searchParams }: Props) {
  const name = typeof searchParams?.name === "string" ? searchParams.name : "";
  return <ThankYouClient name={name} />;
}
