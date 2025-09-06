import { useState, useEffect } from "react";
import { Plus, Search, Eye, Trash2, DollarSign } from "lucide-react";
import { apiClient, type Payment, type GetPaymentsQuery } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { CreatePaymentDialog } from "@/components/CreatePaymentDialogFixed";

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  PAID: "bg-green-500/10 text-green-600 border-green-500/20",
  OVERDUE: "bg-red-500/10 text-red-600 border-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const statusLabels = {
  PENDING: "Pending",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  // const [showBulkDialog, setShowBulkDialog] = useState(false);
  // const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [stats, setStats] = useState({
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const query: GetPaymentsQuery = {
        page: currentPage.toString(),
        limit: "10",
        sortBy: "dueDate",
        sortOrder: "desc",
      };

      if (statusFilter !== "all") {
        query.status = statusFilter as any;
      }

      const response = await apiClient.getPayments(query);
      setPayments(response.payments);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsResponse = await apiClient.getPaymentStats();
      setStats(statsResponse);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [currentPage, statusFilter]);

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await apiClient.markPaymentAsPaid(paymentId);
      toast.success("Payment marked as paid");
      fetchPayments();
      fetchStats();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      toast.error("Failed to mark payment as paid");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    // Use toast for confirmation instead of browser confirm
    toast("Are you sure you want to delete this payment?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await apiClient.deletePayment(paymentId);
            toast.success("Payment deleted successfully");
            fetchPayments();
            fetchStats();
          } catch (error) {
            console.error("Error deleting payment:", error);
            toast.error("Failed to delete payment");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          // Do nothing, just dismiss the toast
        },
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.student.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => toast.info("Bulk create feature coming soon")}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Bulk Create
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Payments
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.totalAmount)} total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.paidPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.paidAmount)} collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.pendingAmount)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.overduePayments}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.overdueAmount)} overdue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>
              Manage all student payments and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">Loading payments...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {payment.student.fullName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {payment.student.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{payment.description}</span>
                          {payment.class && (
                            <span className="text-sm text-muted-foreground">
                              Class: {payment.class.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[payment.status]}
                        >
                          {statusLabels[payment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(payment.dueDate)}</span>
                          {payment.paidDate && (
                            <span className="text-sm text-green-600">
                              Paid: {formatDate(payment.paidDate)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.referenceMonth}/{payment.referenceYear}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {payment.status !== "PAID" && (
                              <DropdownMenuItem
                                onClick={() => handleMarkAsPaid(payment.id)}
                                className="text-green-600"
                              >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            {/* <DropdownMenuItem
                              onClick={() =>
                                toast.info("Edit payment feature coming soon")
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem> */}
                            <DropdownMenuItem
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, total)} of {total} payments
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreatePaymentDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            fetchPayments();
            fetchStats();
          }}
        />
        {/* TODO: Implement Edit and Bulk Create dialogs */}
      </div>
    </DashboardLayout>
  );
}
