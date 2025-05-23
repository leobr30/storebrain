-- CreateEnum
CREATE TYPE "ConditionParameter" AS ENUM ('DATE_RECEIVED', 'DAY');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CNI', 'VITAL_CARD', 'MUTUAL_CARD', 'RIB', 'ADDRESS_PROOF', 'CRIMINAL_RECORD', 'RESIDENCE_PERMIT', 'SICK_LEAVE', 'OTHER');

-- CreateEnum
CREATE TYPE "HistoryType" AS ENUM ('ABSENCE', 'TRAINING', 'OMAR', 'MONDAY_APPOINTMENT', 'ACTION');

-- CreateEnum
CREATE TYPE "JobOnboardingStepType" AS ENUM ('TRAINING', 'RESULT_REVIEW', 'DOCUMENT', 'QUIZZ');

-- CreateEnum
CREATE TYPE "SignatureDocumentType" AS ENUM ('form', 'training', 'omar', 'quizz', 'merged');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('ACQUIRED', 'IN_PROGRESS', 'NOT_ACQUIRED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ENABLED', 'DISABLED', 'PENDING', 'PENDING_ONBOARDING', 'ONBOARDING', 'IN_PROGRESS', 'COMPLETED', 'DRAFT');

-- CreateEnum
CREATE TYPE "UserAbsenceType" AS ENUM ('UNJUSTIFIED_ABSENCE', 'DELAY', 'MEDICAL', 'SICK_CHILDREN', 'DEATH', 'TRANSPORT_ACCIDENT', 'ACCIDENT_AT_WORK', 'VACATION');

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderStoreIds" INTEGER[],
    "receiverStoreIds" INTEGER[],
    "status" "Status" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceRow" (
    "id" SERIAL NOT NULL,
    "image" TEXT,
    "reference" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "balanceId" INTEGER NOT NULL,

    CONSTRAINT "BalanceRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceRowDetail" (
    "id" SERIAL NOT NULL,
    "receiverStoreId" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalSales" INTEGER NOT NULL,
    "lastLifeSpan" INTEGER,
    "balanceRowId" INTEGER NOT NULL,

    CONSTRAINT "BalanceRowDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosingDay" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startRemainingLabeling" INTEGER NOT NULL,
    "endRemainingLabeling" INTEGER NOT NULL,
    "realizedLabeling" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "onerpData" JSONB,
    "savData" JSONB,
    "receptionData" JSONB,

    CONSTRAINT "ClosingDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosingDayComment" (
    "id" SERIAL NOT NULL,
    "closingDayId" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "time" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ClosingDayComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "parentCompanyId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" SERIAL NOT NULL,
    "parameter" "ConditionParameter" NOT NULL,
    "value" TEXT NOT NULL,
    "alertId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeResponse" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "formId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateSignature" TIMESTAMP(3),
    "signatureRequestId" TEXT,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormHistory" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "formId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobContract" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "workingHoursPerWeek" DOUBLE PRECISION NOT NULL,
    "lengthOfTrialPeriod" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,

    CONSTRAINT "JobContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOnboarding" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,

    CONSTRAINT "JobOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOnboardingDocument" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jobOnboardingStepId" INTEGER NOT NULL,

    CONSTRAINT "JobOnboardingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOnboardingResultReview" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "JobOnboardingResultReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOnboardingStep" (
    "id" SERIAL NOT NULL,
    "day" INTEGER NOT NULL DEFAULT 0,
    "month" INTEGER NOT NULL DEFAULT 0,
    "type" "JobOnboardingStepType" NOT NULL,
    "jobOnboardingId" INTEGER NOT NULL,
    "trainingModelId" INTEGER,
    "jobOnboardingResultReviewId" INTEGER,
    "jobOnboardingQuizzId" INTEGER,

    CONSTRAINT "JobOnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MondayAppointment" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remainingDays" INTEGER NOT NULL,
    "objective" INTEGER NOT NULL,
    "objectiveOr" INTEGER NOT NULL,
    "objectiveMode" INTEGER NOT NULL,
    "realizedRevenue" INTEGER NOT NULL,
    "remainingRevenue" INTEGER NOT NULL,
    "realizedRevenueOr" INTEGER NOT NULL,
    "remainingRevenueOr" INTEGER NOT NULL,
    "realizedRevenueMode" INTEGER NOT NULL,
    "remainingRevenueMode" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "MondayAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MondayAppointmentDetail" (
    "id" SERIAL NOT NULL,
    "onerpId" INTEGER NOT NULL,
    "fullname" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "objective" INTEGER NOT NULL,
    "realizedRevenue" INTEGER NOT NULL,
    "remainingRevenue" INTEGER NOT NULL,
    "remainingDays" INTEGER NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "userId" INTEGER,
    "omarId" INTEGER,
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "MondayAppointmentDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Omar" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objective" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "nextAppointment" DATE,
    "dueDate" DATE,
    "observation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "dateSignature" TIMESTAMP(3),
    "signatureRequestId" TEXT,

    CONSTRAINT "Omar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ParentCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceUpdate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceUpdateRow" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "lastPrice" DOUBLE PRECISION NOT NULL,
    "newPrice" DOUBLE PRECISION NOT NULL,
    "priceDifference" DOUBLE PRECISION NOT NULL,
    "newPurchasePrice" DOUBLE PRECISION NOT NULL,
    "newSalePrice" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "priceUpdateId" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "PriceUpdateRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceUpdateRowArticle" (
    "id" SERIAL NOT NULL,
    "shop" INTEGER NOT NULL,
    "article" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "lastSalePrice" DOUBLE PRECISION NOT NULL,
    "newSalePrice" DOUBLE PRECISION NOT NULL,
    "priceUpdateRowId" INTEGER NOT NULL,

    CONSTRAINT "PriceUpdateRowArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quizz" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "signatureRequestId" TEXT,
    "createdById" INTEGER NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    "dateSignature" TIMESTAMP(3),

    CONSTRAINT "Quizz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizzAnswer" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "QuizzAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizzQuestion" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "correctAnswerId" INTEGER,
    "imageUrl" TEXT,

    CONSTRAINT "QuizzQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizzSection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "quizzId" INTEGER NOT NULL,

    CONSTRAINT "QuizzSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureRequestLog" (
    "id" SERIAL NOT NULL,
    "signatureRequestId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSignature" TIMESTAMP(3),
    "documentId" TEXT NOT NULL,
    "type" "SignatureDocumentType" NOT NULL,

    CONSTRAINT "SignatureRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "validateAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "realizedById" INTEGER,
    "userJobOnboardingId" INTEGER NOT NULL,
    "dateSignature" TIMESTAMP(3),
    "signatureRequestId" TEXT,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "numberOAppointmentsRequired" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "TrainingModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingModelSubject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "trainingModelId" INTEGER NOT NULL,

    CONSTRAINT "TrainingModelSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSubject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" "State" NOT NULL DEFAULT 'NOT_ACQUIRED',
    "trainingId" INTEGER NOT NULL,

    CONSTRAINT "TrainingSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSubjectFile" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "trainingSubjectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSubjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "name" TEXT,
    "lastName" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL DEFAULT '',
    "entryDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "badgeNumber" TEXT,
    "password" TEXT,
    "refreshToken" TEXT,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "jobId" INTEGER,
    "contractId" INTEGER,
    "zone" TEXT,
    "onerpId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAbsence" (
    "id" SERIAL NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "sicknessStartDate" TIMESTAMP(3),
    "sicknessEndDate" TIMESTAMP(3),
    "familyRelationShip" TEXT,
    "timeOfAccident" TIMESTAMP(3),
    "placeOfAccident" TEXT,
    "circumstances" TEXT,
    "injuries" TEXT,
    "schedule" TIMESTAMP(3),
    "type" "UserAbsenceType" NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'IN_PROGRESS',
    "vacationUserId" INTEGER,

    CONSTRAINT "UserAbsence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDocument" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "historyId" INTEGER NOT NULL,

    CONSTRAINT "UserDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHistory" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "type" "HistoryType" NOT NULL DEFAULT 'ACTION',
    "idUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInformation" (
    "id" SERIAL NOT NULL,
    "maidenName" TEXT,
    "dateOfBirth" DATE NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "socialSecurityNumber" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cellPhone" TEXT NOT NULL,
    "numberOfChildren" INTEGER NOT NULL,
    "familySituation" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "zipCode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJobOnboarding" (
    "id" SERIAL NOT NULL,
    "appointmentNumber" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "jobOnboardingStepId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "Status" NOT NULL,
    "responseId" TEXT,
    "formId" TEXT,

    CONSTRAINT "UserJobOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersOnCompanies" (
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL,

    CONSTRAINT "UsersOnCompanies_pkey" PRIMARY KEY ("userId","companyId")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClosingDay_date_key" ON "ClosingDay"("date" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Form_signatureRequestId_key" ON "Form"("signatureRequestId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Job_name_qualification_key" ON "Job"("name" ASC, "qualification" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "JobContract_jobId_key" ON "JobContract"("jobId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "JobContract_type_workingHoursPerWeek_lengthOfTrialPeriod_jo_key" ON "JobContract"("type" ASC, "workingHoursPerWeek" ASC, "lengthOfTrialPeriod" ASC, "jobId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "JobOnboarding_jobId_key" ON "JobOnboarding"("jobId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "MondayAppointmentDetail_omarId_key" ON "MondayAppointmentDetail"("omarId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Omar_signatureRequestId_key" ON "Omar"("signatureRequestId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Quizz_signatureRequestId_key" ON "Quizz"("signatureRequestId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SignatureRequestLog_signatureRequestId_key" ON "SignatureRequestLog"("signatureRequestId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Training_signatureRequestId_key" ON "Training"("signatureRequestId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "UserInformation_userId_key" ON "UserInformation"("userId" ASC);

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B" ASC);

-- AddForeignKey
ALTER TABLE "BalanceRow" ADD CONSTRAINT "BalanceRow_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "Balance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceRowDetail" ADD CONSTRAINT "BalanceRowDetail_balanceRowId_fkey" FOREIGN KEY ("balanceRowId") REFERENCES "BalanceRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClosingDayComment" ADD CONSTRAINT "ClosingDayComment_closingDayId_fkey" FOREIGN KEY ("closingDayId") REFERENCES "ClosingDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClosingDayComment" ADD CONSTRAINT "ClosingDayComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "ParentCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeResponse" ADD CONSTRAINT "EmployeeResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeResponse" ADD CONSTRAINT "EmployeeResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormHistory" ADD CONSTRAINT "FormHistory_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormHistory" ADD CONSTRAINT "FormHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobContract" ADD CONSTRAINT "JobContract_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOnboarding" ADD CONSTRAINT "JobOnboarding_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOnboardingDocument" ADD CONSTRAINT "JobOnboardingDocument_jobOnboardingStepId_fkey" FOREIGN KEY ("jobOnboardingStepId") REFERENCES "JobOnboardingStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOnboardingStep" ADD CONSTRAINT "JobOnboardingStep_jobOnboardingId_fkey" FOREIGN KEY ("jobOnboardingId") REFERENCES "JobOnboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOnboardingStep" ADD CONSTRAINT "JobOnboardingStep_jobOnboardingQuizzId_fkey" FOREIGN KEY ("jobOnboardingQuizzId") REFERENCES "Quizz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOnboardingStep" ADD CONSTRAINT "JobOnboardingStep_jobOnboardingResultReviewId_fkey" FOREIGN KEY ("jobOnboardingResultReviewId") REFERENCES "JobOnboardingResultReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOnboardingStep" ADD CONSTRAINT "JobOnboardingStep_trainingModelId_fkey" FOREIGN KEY ("trainingModelId") REFERENCES "TrainingModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MondayAppointment" ADD CONSTRAINT "MondayAppointment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MondayAppointmentDetail" ADD CONSTRAINT "MondayAppointmentDetail_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "MondayAppointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MondayAppointmentDetail" ADD CONSTRAINT "MondayAppointmentDetail_omarId_fkey" FOREIGN KEY ("omarId") REFERENCES "Omar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MondayAppointmentDetail" ADD CONSTRAINT "MondayAppointmentDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Omar" ADD CONSTRAINT "Omar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Omar" ADD CONSTRAINT "Omar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceUpdateRow" ADD CONSTRAINT "PriceUpdateRow_priceUpdateId_fkey" FOREIGN KEY ("priceUpdateId") REFERENCES "PriceUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceUpdateRowArticle" ADD CONSTRAINT "PriceUpdateRowArticle_priceUpdateRowId_fkey" FOREIGN KEY ("priceUpdateRowId") REFERENCES "PriceUpdateRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quizz" ADD CONSTRAINT "Quizz_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quizz" ADD CONSTRAINT "Quizz_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizzAnswer" ADD CONSTRAINT "QuizzAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizzQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizzAnswer" ADD CONSTRAINT "QuizzAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizzQuestion" ADD CONSTRAINT "QuizzQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "QuizzSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizzSection" ADD CONSTRAINT "QuizzSection_quizzId_fkey" FOREIGN KEY ("quizzId") REFERENCES "Quizz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRequestLog" ADD CONSTRAINT "SignatureRequestLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_realizedById_fkey" FOREIGN KEY ("realizedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_userJobOnboardingId_fkey" FOREIGN KEY ("userJobOnboardingId") REFERENCES "UserJobOnboarding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingModelSubject" ADD CONSTRAINT "TrainingModelSubject_trainingModelId_fkey" FOREIGN KEY ("trainingModelId") REFERENCES "TrainingModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSubject" ADD CONSTRAINT "TrainingSubject_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSubjectFile" ADD CONSTRAINT "TrainingSubjectFile_trainingSubjectId_fkey" FOREIGN KEY ("trainingSubjectId") REFERENCES "TrainingSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "JobContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAbsence" ADD CONSTRAINT "UserAbsence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAbsence" ADD CONSTRAINT "UserAbsence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAbsence" ADD CONSTRAINT "UserAbsence_vacationUserId_fkey" FOREIGN KEY ("vacationUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "UserHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInformation" ADD CONSTRAINT "UserInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobOnboarding" ADD CONSTRAINT "UserJobOnboarding_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobOnboarding" ADD CONSTRAINT "UserJobOnboarding_jobOnboardingStepId_fkey" FOREIGN KEY ("jobOnboardingStepId") REFERENCES "JobOnboardingStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobOnboarding" ADD CONSTRAINT "UserJobOnboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnCompanies" ADD CONSTRAINT "UsersOnCompanies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnCompanies" ADD CONSTRAINT "UsersOnCompanies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

