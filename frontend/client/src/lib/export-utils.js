var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }
    var headers = Object.keys(data[0]);
    var csvContent = __spreadArray([
        headers.join(",")
    ], data.map(function (row) {
        return headers
            .map(function (header) {
            var value = row[header];
            if (typeof value === "string" && value.includes(",")) {
                return "\"".concat(value, "\"");
            }
            return value !== null && value !== void 0 ? value : "";
        })
            .join(",");
    }), true).join("\n");
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "".concat(filename, "-").concat(new Date().toISOString().split("T")[0], ".csv"));
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export function exportToJSON(data, filename) {
    var jsonString = JSON.stringify(data, null, 2);
    var blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "".concat(filename, "-").concat(new Date().toISOString().split("T")[0], ".json"));
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export function generateBranchReport(branchData, branchName) {
    var _a, _b, _c, _d;
    var timestamp = new Date().toLocaleString();
    var report = "\nBRANCH MANAGEMENT REPORT\nBranch: ".concat(branchName, "\nGenerated: ").concat(timestamp, "\n\n================== SUMMARY ==================\nTotal Loans: ").concat(branchData.totalLoans || 0, "\nActive Loans: ").concat(branchData.activeLoans || 0, "\nPending Loans: ").concat(branchData.pendingLoans || 0, "\nTotal Members: ").concat(branchData.totalMembers || 0, "\nTotal Savings: KES ").concat(((_a = branchData.totalSavings) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || 0, "\nCollection Rate: ").concat(((_b = branchData.collectionRate) === null || _b === void 0 ? void 0 : _b.toFixed(1)) || 0, "%\n\n================== STAFF ==================\n").concat(branchData.staffCount || 0, " staff members\n\n").concat(branchData.staffByRole
        ? Object.entries(branchData.staffByRole)
            .map(function (_a) {
            var role = _a[0], count = _a[1];
            return "".concat(role, ": ").concat(count);
        })
            .join("\n")
        : "No staff information", "\n\n================== GROUPS ==================\nTotal Groups: ").concat(branchData.groupCount || 0, "\n\n").concat(branchData.groups
        ? branchData.groups
            .map(function (group) {
            var _a;
            return "\nGroup: ".concat(group.name, "\nMembers: ").concat(group.totalMembers, "\nSavings: KES ").concat(parseFloat(group.totalSavings || 0).toLocaleString(), "\nOutstanding Loans: KES ").concat(parseFloat(group.totalLoansOutstanding || 0).toLocaleString(), "\nRepayment Rate: ").concat(((_a = group.repaymentRate) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || 0, "%\n");
        })
            .join("\n")
        : "No group information", "\n\n================== LOAN PRODUCTS ==================\nTotal Products: ").concat(((_c = branchData.products) === null || _c === void 0 ? void 0 : _c.length) || 0, "\n\n").concat(branchData.products
        ? branchData.products
            .map(function (product) { return "\nProduct: ".concat(product.name, "\nPrice: KES ").concat(parseFloat(product.sellingPrice || 0).toLocaleString(), "\nStock: ").concat(product.stockQuantity || 0, "\nCategory: ").concat(product.categoryId || "Unknown", "\n"); })
            .join("\n")
        : "No product information", "\n\n================== STORE & SUPPLIERS ==================\nTotal Suppliers: ").concat(((_d = branchData.suppliers) === null || _d === void 0 ? void 0 : _d.length) || 0, "\n\n").concat(branchData.suppliers
        ? branchData.suppliers
            .map(function (supplier) { return "\nSupplier: ".concat(supplier.name, "\nContact: ").concat(supplier.phone, "\nEmail: ").concat(supplier.email || "N/A", "\nLocation: ").concat(supplier.location || "N/A", "\nRating: ").concat(supplier.rating || "N/A", "\nActive: ").concat(supplier.isActive ? "Yes" : "No", "\n"); })
            .join("\n")
        : "No supplier information", "\n\nGenerated by Imarisha Loan Management System\n");
    return report;
}
export function downloadReport(content, filename) {
    var blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "".concat(filename, "-").concat(new Date().toISOString().split("T")[0], ".txt"));
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export function flattenGroupData(groups) {
    return groups.map(function (group) { return ({
        "Group Name": group.name,
        "Total Members": group.totalMembers || 0,
        "Total Savings (KES)": parseFloat(group.totalSavings || 0).toLocaleString(),
        "Outstanding Loans (KES)": parseFloat(group.totalLoansOutstanding || 0).toLocaleString(),
        "Repayment Rate (%)": (group.repaymentRate || 0).toFixed(1),
        "Location": group.location || "N/A",
    }); });
}
export function flattenStaffData(staff) {
    return staff.map(function (user) {
        var _a;
        return ({
            "Full Name": "".concat(user.firstName, " ").concat(user.lastName),
            "Username": user.username,
            "Email": user.email || "N/A",
            "Phone": user.phone || "N/A",
            "Role": ((_a = user.role) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " ")) || "N/A",
            "Status": user.isActive ? "Active" : "Inactive",
        });
    });
}
export function flattenProductData(products) {
    return products.map(function (product) { return ({
        "Product Name": product.name,
        "Category": product.categoryId || "N/A",
        "Buying Price (KES)": parseFloat(product.buyingPrice || 0).toLocaleString(),
        "Selling Price (KES)": parseFloat(product.sellingPrice || 0).toLocaleString(),
        "Stock Quantity": product.stockQuantity || 0,
        "Low Stock Threshold": product.lowStockThreshold || 0,
        "Status": product.is_active ? "Active" : "Inactive",
    }); });
}
export function flattenSupplierData(suppliers) {
    return suppliers.map(function (supplier) { return ({
        "Supplier Name": supplier.name,
        "Company": supplier.companyName || "N/A",
        "Contact Person": supplier.contactPerson || "N/A",
        "Phone": supplier.phone,
        "Email": supplier.email || "N/A",
        "Location": supplier.location || "N/A",
        "Rating": supplier.rating || "N/A",
        "Total Supplies": supplier.totalSupplies || 0,
        "Status": supplier.isActive ? "Active" : "Inactive",
    }); });
}
export function flattenLoanData(loans) {
    return loans.map(function (loan) { return ({
        "Loan ID": loan.id || "N/A",
        "Member": loan.memberName || "N/A",
        "Amount (KES)": parseFloat(loan.totalAmount || 0).toLocaleString(),
        "Status": loan.status || "N/A",
        "Applied Date": loan.appliedDate || "N/A",
        "Disbursed Date": loan.disbursedDate || "N/A",
        "Expected Due Date": loan.expectedDueDate || "N/A",
    }); });
}
