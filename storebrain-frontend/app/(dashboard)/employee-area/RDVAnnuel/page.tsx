'use client';

import { useState } from 'react';
import EmployeeSelector from '@/features/employee-area/components/RDV-Annuel/EmployeeSelector';
import EntretienForm from '@/features/employee-area/components/RDV-Annuel/EntretienForm';
import EntretienHistory from '@/features/employee-area/components/RDV-Annuel/EntretienHistory';
import { Employee } from '@/features/employee-area/types';
import { AnnualReview } from '@/features/employee-area/components/RDV-Annuel/types';

export default function Page() {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [reviewToEdit, setReviewToEdit] = useState<AnnualReview | null>(null);
    const companyId = 1;

    const handleSelectEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setReviewToEdit(null);
    };

    const handleCancelForm = () => {
        setReviewToEdit(null);
        setSelectedEmployee(null);
    };

    const handleSaveForm = () => {
        setReviewToEdit(null);
    };

    return (
        <div className="container mx-auto py-10 space-y-6">
            {!selectedEmployee ? (
                <EmployeeSelector onSelectEmployee={handleSelectEmployee} selectedCompanyId={companyId} />
            ) : (
                <>
                    <EntretienForm
                        employee={selectedEmployee}
                        existingReview={reviewToEdit ?? undefined}
                        onCancel={handleCancelForm}
                        onSave={handleSaveForm}
                        companyId={companyId}
                    />

                    <EntretienHistory
                        companyId={companyId}
                        employeeId={selectedEmployee.id}
                        onViewReview={(review) => {
                            setReviewToEdit(review);
                        }}
                    />
                </>
            )}
        </div>
    );
}
