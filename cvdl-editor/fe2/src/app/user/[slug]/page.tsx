// Fetch data from the server and route to home page

import { redirect } from "next/navigation";

export default async function UserPage({ params }: { params: { slug: string }}) {
    redirect(`/?user=${params.slug}`);
}


