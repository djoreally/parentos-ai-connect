
import AuditLogTable from "@/components/AuditLogTable";
import Header from "@/components/Header";

const ComplianceDashboardPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <AuditLogTable />
            </main>
        </div>
    );
};

export default ComplianceDashboardPage;
