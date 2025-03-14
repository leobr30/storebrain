"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlarmClock, Briefcase, CalendarDays, Clock7, Hourglass, IdCard, Layers, Send } from "lucide-react";
import { StatusBadge } from "../status-badge";
import { useState } from "react";
import { updateEmployeeInformation } from "@/features/employee-area/components/employee/employee-information-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EmployeeInformationProps = {
    employee: Employee;
};

export const EmployeeInformation = ({ employee }: EmployeeInformationProps) => {
    const [employeeData, setEmployeeData] = useState(employee);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        entryDate: employee.entryDate ? new Date(employee.entryDate).toISOString().split("T")[0] : "",
        job: employee.job?.name || "",
        contract: employee.contract?.type || "",
        zone: employee.zone || "",
        badgeNumber: employee.badgeNumber || "",
        trialEndDate: employee.trialEndDate ? new Date(employee.trialEndDate).toISOString().split("T")[0] : "",
        endDate: employee.endDate ? new Date(employee.endDate).toISOString().split("T")[0] : "",
    });

    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    
    const handleSave = async () => {
        const result = await updateEmployeeInformation(employee.id, formData);

        if (result.success) {
            alert("Mise à jour réussie !");

            
            setEmployeeData((prev) => ({
                ...prev,
                firstName: formData.firstName,
                lastName: formData.lastName,
                entryDate: formData.entryDate,
                job: prev.job ? { ...prev.job, name: formData.job } : { name: formData.job },
                contract: prev.contract ? { ...prev.contract, type: formData.contract } : { type: formData.contract },
                zone: formData.zone,
                badgeNumber: formData.badgeNumber,
                trialEndDate: formData.trialEndDate,
                endDate: formData.endDate,
            }));

            setIsEditing(false);
        } else {
            alert(`Erreur : ${result.error}`);
        }
    };

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle>Information:</CardTitle>
                <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                    {isEditing ? "Sauvegarder" : "✏️"}
                </Button>
            </CardHeader>
            <CardContent>
                <ul className="space-y-5">
                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Layers className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Statut:</span>
                        </div>
                        <StatusBadge status={employeeData.status} />
                    </li>

                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <CalendarDays className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Date d'entrée:</span>
                        </div>
                        {isEditing ? (
                            <Input type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} />
                        ) : (
                            <span className="text-sm text-default-700">
                                {new Date(employeeData.entryDate).toLocaleDateString()}
                            </span>
                        )}
                    </li>

                    
                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Hourglass className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Fin de période d'essai:</span>
                        </div>
                        {isEditing ? (
                            <Input type="date" name="trialEndDate" value={formData.trialEndDate} onChange={handleChange} />
                        ) : (
                            <span className="text-sm text-default-700">
                                {employeeData.trialEndDate ? new Date(employeeData.trialEndDate).toLocaleDateString() : "-"}
                            </span>
                        )}
                    </li>

                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Briefcase className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Emploi:</span>
                        </div>
                        {isEditing ? (
                            <Input type="text" name="job" value={formData.job} onChange={handleChange} />
                        ) : (
                            <span className="text-sm text-default-700">{employeeData.job?.name}</span>
                        )}
                    </li>

                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Clock7 className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Contrat:</span>
                        </div>
                        {isEditing ? (
                            <Input type="text" name="contract" value={formData.contract} onChange={handleChange} />
                        ) : (
                            <span className="text-sm text-default-700">
                                {employeeData.contract?.type} ({employeeData.contract?.workingHoursPerWeek}h)
                            </span>
                        )}
                    </li>

                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Send className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Zone:</span>
                        </div>
                        {isEditing ? (
                            <Input type="text" name="zone" value={formData.zone} onChange={handleChange} />
                        ) : (
                            <span className="text-sm text-default-700">{employeeData.zone}</span>
                        )}
                    </li>

                    
                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <IdCard className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Badge:</span>
                        </div>
                        {isEditing ? (
                            <Input type="text" name="badgeNumber" value={formData.badgeNumber} onChange={handleChange} />
                        ) : (
                            <span className="text-sm text-default-700">{employeeData.badgeNumber}</span>
                        )}
                    </li>

                    
                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <AlarmClock className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Date de fin:</span>
                        </div>
                        {isEditing ? (
                            <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                        ) : (
                            <span className="text-sm text-default-700">
                                {employeeData.endDate ? new Date(employeeData.endDate).toLocaleDateString() : "-"}
                            </span>
                        )}
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
};
