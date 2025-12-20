var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export var downloadCSV = function (data, filename) {
    if (data.length === 0) {
        alert("No data to export");
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
            return value;
        })
            .join(",");
    }), true).join("\n");
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "".concat(filename, ".csv"));
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
export var downloadJSON = function (data, filename) {
    var jsonString = JSON.stringify(data, null, 2);
    var blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "".concat(filename, ".json"));
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
export var downloadExcel = function (data, filename) {
    if (data.length === 0) {
        alert("No data to export");
        return;
    }
    var headers = Object.keys(data[0]);
    var htmlContent = "\n    <table border=\"1\" cellpadding=\"10\" cellspacing=\"0\">\n      <thead>\n        <tr style=\"background-color: #4CAF50; color: white;\">\n          ".concat(headers.map(function (h) { return "<th>".concat(h, "</th>"); }).join(""), "\n        </tr>\n      </thead>\n      <tbody>\n        ").concat(data
        .map(function (row) { return "\n          <tr>\n            ".concat(headers.map(function (h) { return "<td>".concat(row[h], "</td>"); }).join(""), "\n          </tr>\n        "); })
        .join(""), "\n      </tbody>\n    </table>\n  ");
    var blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "".concat(filename, ".xls"));
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
export var generateGroupReport = function (groups, members, loans) {
    return groups.map(function (group) {
        var groupMembers = members.filter(function (m) { return m.groupId === group.id; });
        var groupLoans = loans.filter(function (l) {
            var loanMember = members.find(function (m) { return m.id === l.memberId; });
            return loanMember && loanMember.groupId === group.id;
        });
        var totalLoanAmount = groupLoans.reduce(function (sum, l) { return sum + parseFloat(l.principleAmount || 0); }, 0);
        var outstandingBalance = groupLoans.reduce(function (sum, l) { return sum + parseFloat(l.outstandingBalance || 0); }, 0);
        return {
            "Group ID": group.id,
            "Group Name": group.name,
            "Branch ID": group.branchId,
            "Loan Officer ID": group.loanOfficerId,
            "Total Members": groupMembers.length,
            "Max Members": group.maxMembers,
            "Active Members": groupMembers.filter(function (m) { return m.status === "active"; })
                .length,
            "Total Loans": groupLoans.length,
            "Total Loan Amount": "KES ".concat(totalLoanAmount.toLocaleString()),
            "Outstanding Balance": "KES ".concat(outstandingBalance.toLocaleString()),
            Status: group.isActive ? "Active" : "Inactive",
            "Created Date": new Date(group.createdAt).toLocaleDateString(),
        };
    });
};
export var generateGroupMembersReport = function (groupId, groupName, members, loans) {
    var groupMembers = members.filter(function (m) { return m.groupId === groupId; });
    return groupMembers.map(function (member) {
        var memberLoans = loans.filter(function (l) { return l.memberId === member.id; });
        var totalLoaned = memberLoans.reduce(function (sum, l) { return sum + parseFloat(l.principleAmount || 0); }, 0);
        var outstanding = memberLoans.reduce(function (sum, l) { return sum + parseFloat(l.outstandingBalance || 0); }, 0);
        return {
            "Member Code": member.memberCode,
            Status: member.status,
            "Risk Score": member.riskScore,
            "Risk Category": member.riskCategory,
            "Total Loans": memberLoans.length,
            "Total Loaned": "KES ".concat(totalLoaned.toLocaleString()),
            "Outstanding": "KES ".concat(outstanding.toLocaleString()),
            "Created Date": new Date(member.createdAt).toLocaleDateString(),
        };
    });
};
export var generateLoansReport = function (loans) {
    return loans.map(function (loan) { return ({
        "Loan Number": loan.loanNumber,
        "Principal Amount": "KES ".concat(parseFloat(loan.principleAmount).toLocaleString()),
        "Total Amount": "KES ".concat(parseFloat(loan.totalAmount).toLocaleString()),
        "Outstanding Balance": "KES ".concat(parseFloat(loan.outstandingBalance).toLocaleString()),
        Status: loan.status,
        "Application Date": new Date(loan.applicationDate).toLocaleDateString(),
        "Due Date": loan.dueDate
            ? new Date(loan.dueDate).toLocaleDateString()
            : "N/A",
    }); });
};
