import IndexWebsite from "@/components/indexWebsite";
import { headers } from "next/headers";
import RenderPublicPageContent from './p/[...slug]/page';

export default async function Home({ params, searchParams }: { params: any; searchParams: any }) {
  const headersList = await headers();
  let host = headersList?.get('host') || '';
  if (process.env?.NEXT_PUBLIC_UI_URLS?.includes(host)) return <IndexWebsite />;
  if (host.includes('127.0.0.1')) host = '127.0.0.1';
  return <RenderPublicPageContent params={params} searchParams={searchParams} customDomain={host} />;
}
