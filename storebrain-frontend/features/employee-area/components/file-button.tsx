import { Button } from "@/components/ui/button";
import Image from "next/image";
import pdfi from "@/public/images/files/pdf.png";
import excel from '@/public/images/files/excel.png'
import path from "path";
import { AlertDialogAttachment } from "./training-drawer/alert-dialog-attachement";
type FileButtonProps = {
    fileName: string;
    id: number;
    onDelete: (attachmentId: number) => void;
    onDownload: (attachmentId: number) => void;
}

export const FileButton = ({fileName, id, onDelete, onDownload}:FileButtonProps) => {
    return (
        <div className="flex gap-2.5">
        <Button variant="soft" type="button" className="space-x-2.5 grow" onClick={() => onDownload(id)}>
            <div>
                <Image
                    alt=""
                    className="h-5 w-5"
                    src={
                        (path.extname(fileName) === ".pdf" && pdfi) || 
                        (path.extname(fileName).includes(".xls") || path.extname(fileName).includes(".xlsx") || path.extname(fileName).includes(".csv")  ) && excel ||                                                
                        ''
                    }
                />
            </div>
            <div>
                {fileName}
            </div>
        </Button>
        <AlertDialogAttachment id={id} onDelete={onDelete} />
        </div>
        
        // <div className="flex  bg-default-100  space-x-2  p-2 rounded-sm hover:cursor-pointer">
        //     <div>
        //         <Image
        //             alt=""
        //             className="h-5 w-5"
        //             src={
        //                 (document?.mimeType === "application/pdf" && pdfi) || ''
        //             }
        //         />
        //     </div>
        //     <div>
        //         {document.fileName}
        //     </div>
        // </div>




    )
}