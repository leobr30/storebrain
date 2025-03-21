"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"


export const EmployeeFormation = () => {
    return (
        <div className="space-y-4">
            <Card>

                <CardHeader className="flex-row justify-between items-center "> <CardTitle>Formation</CardTitle> <Button>Ajouter</Button></CardHeader>
                    
                <CardContent>
                    <div className="rounded-md border"> <Table wrapperClass="h-[500px] overflow-auto custom-scrollbar"><TableHeader className="bg-default-100 sticky top-0">
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Réaliser par</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader></Table>
                        </div> 
                </CardContent>

            </Card>
        </div>


    )
}