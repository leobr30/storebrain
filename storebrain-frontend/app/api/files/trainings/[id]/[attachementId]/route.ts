import { fetchFile } from "@/lib/fetch";

export async function GET(request: Request, {params}: {params: {id: string, attachementId: string}}) {
    const response = await fetchFile(`trainings/${params.id}/download-attachment/${params.attachementId}`)
    return response
}