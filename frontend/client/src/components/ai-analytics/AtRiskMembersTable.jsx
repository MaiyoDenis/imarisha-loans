var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React from 'react';
import { AlertTriangle, TrendingUp, Phone } from 'lucide-react';
var getRiskColor = function (score) {
    if (score > 0.8)
        return 'text-destructive bg-destructive/10';
    if (score > 0.7)
        return 'text-orange-600 bg-orange-50';
    return 'text-accent bg-accent/10';
};
var getRiskBadgeColor = function (score) {
    if (score > 0.8)
        return 'bg-red-100 text-red-800';
    if (score > 0.7)
        return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
};
export var AtRiskMembersTable = function (_a) {
    var members = _a.members, totalScanned = _a.totalScanned, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    if (isLoading) {
        return (<div className="bg-card rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {__spreadArray([], Array(5), true).map(function (_, i) { return (<div key={i} className="h-12 bg-gray-200 rounded"></div>); })}
          </div>
        </div>
      </div>);
    }
    if (!members) {
        return null;
    }
    var atRiskPercentage = ((members.length / totalScanned) * 100).toFixed(1);
    return (<div className="bg-card rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive"/>
            At-Risk Members
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {members.length} of {totalScanned} members flagged for intervention ({atRiskPercentage}%)
          </p>
        </div>
      </div>

      {members.length === 0 ? (<div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <TrendingUp className="w-6 h-6 text-secondary"/>
          </div>
          <p className="text-muted-foreground">No at-risk members identified. Portfolio is healthy!</p>
        </div>) : (<div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground">Member Name</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Risk Score</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Outstanding Balance</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Risk Factors</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map(function (member) { return (<tr key={member.member_id} className="border-b border-gray-100 hover:bg-muted">
                  <td className="py-4 px-4 text-foreground font-medium">
                    <div className="flex flex-col">
                      <span>{member.member_name}</span>
                      <span className="text-xs text-gray-500">ID: {member.member_id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={"px-3 py-1 rounded-full text-sm font-medium ".concat(getRiskBadgeColor(member.risk_score))}>
                      {(member.risk_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-foreground font-medium">
                    KES {member.outstanding_balance.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      {member.risk_factors.slice(0, 2).map(function (factor, idx) { return (<span key={idx} className="text-xs bg-gray-100 text-foreground px-2 py-1 rounded w-fit">
                          {factor}
                        </span>); })}
                      {member.risk_factors.length > 2 && (<span className="text-xs text-gray-500">
                          +{member.risk_factors.length - 2} more
                        </span>)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-blue-700 rounded hover:bg-blue-100 transition">
                      <Phone className="w-4 h-4"/>
                      <span className="hidden sm:inline">Contact</span>
                    </button>
                  </td>
                </tr>); })}
            </tbody>
          </table>
        </div>)}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">

          <p className="text-sm text-red-800 font-medium">Critical (Score {'>'} 0.8)</p>
          <p className="text-2xl font-bold text-destructive mt-1">
            {members.filter(function (m) { return m.risk_score > 0.8; }).length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800 font-medium">High (Score 0.7-0.8)</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {members.filter(function (m) { return m.risk_score > 0.7 && m.risk_score <= 0.8; }).length}
          </p>
        </div>
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">Medium (Score 0.6-0.7)</p>
          <p className="text-2xl font-bold text-accent mt-1">
            {members.filter(function (m) { return m.risk_score >= 0.6 && m.risk_score <= 0.7; }).length}
          </p>
        </div>
      </div>
    </div>);
};
