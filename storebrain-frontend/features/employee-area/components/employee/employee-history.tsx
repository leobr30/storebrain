import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from "@/components/ui/timeline"
import Image from "next/image";
import pdfi from "@/public/images/files/pdf.png";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

// ✅ Types
type EmployeeHistoryProps = {
    histories: EmployeeHistory[]
}

const FileCard = (document: EmployeeDocument) => {
    return (
        <Button variant="soft" className="space-x-2.5">
            <div>
                <Image
                    alt=""
                    className="h-5 w-5"
                    src={
                        (document?.mimeType === "application/pdf" && pdfi) || ''
                    }
                />
            </div>
            <div>
                {document.fileName}
            </div>
        </Button>
    )
}

export const EmployeeHistory = ({ histories }: EmployeeHistoryProps) => {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    const handleView = (type: string, id: number) => {
        const newSearchParams = new URLSearchParams(searchParams)
        if (type === 'TRAINING') {
            newSearchParams.set('trainingId', id.toString())
        }
        if (type === 'ABSENCE') {
            newSearchParams.set('absenceId', id.toString())
        }
        window.history.replaceState(null, '', `${pathName}?${newSearchParams.toString()}`)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
                <Timeline>
                    {histories
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((history, index) => (
                            <TimelineItem key={history.id}>
                                <TimelineSeparator>
                                    <TimelineDot color="primary" variant="outline" />
                                    {index !== histories.length - 1 ? <TimelineConnector /> : null}
                                </TimelineSeparator>
                                <TimelineContent>
                                    <div className="tm-content">
                                        <div className="md:flex gap-5">
                                            <div className="grow">
                                                <h2 className="font-semibold text-lg text-default-600">
                                                    {history.title}
                                                </h2>
                                            </div>
                                            <div className="text-default-400 md:min-w-[90px] md:max-w-[120px] md:text-right">
                                                {new Date(history.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <hr className="my-3" />
                                        <span className="font-medium text-default-600">
                                            {history.type === 'ACTION' ? (
                                                history.title === 'Document'
                                                    ? `${history.createdBy.name} ${history.text}`
                                                    : `${history.createdBy.name} ${history.text}`
                                            ) : (
                                                <Button variant="link" onClick={() => handleView(history.type, history.idUrl)}>
                                                    {history.createdBy.name} {history.text}
                                                </Button>
                                            )}
                                        </span>
                                        <div className="mt-2.5 flex flex-row space-x-2.5">
                                            {history.documents.map(document => <FileCard key={document.id} {...document} />)}
                                        </div>
                                    </div>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                </Timeline>
            </CardContent>
        </Card>
    )
}
