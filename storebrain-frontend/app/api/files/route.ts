import { fetchFile, fetchWithAuth } from "@/lib/fetch";

export async function GET(request: Request) {
    const response =await fetchFile(`trainings/17/download-attachment/22`)
    const header = response.headers.get('Content-Disposition');
    const parts = header!.split(';');
    const filename = parts[1].split('=')[1].replaceAll("\"", "");
    const blob = await response.blob()    

    const newHeaders = new Headers();
    newHeaders.append("Content-Disposition", `attachment; filename="${filename}"`);
    newHeaders.append("Content-Type", "application/octet-stream");
    return new Response(blob, {
        headers: newHeaders
    })
}