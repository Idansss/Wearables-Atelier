import { AdminProvider } from "../../context/AdminContext";
import { AdminGuard } from "../../components/admin/AdminGuard";
import { AdminLayout } from "../../components/admin/AdminLayout";

export default function AdminShell() {
  return (
    <AdminProvider>
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    </AdminProvider>
  );
}
