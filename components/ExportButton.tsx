
import React from 'react';
import * as XLSX from 'xlsx';
import { PurchaseOrder, POStatus } from '../types';

interface ExportButtonProps {
  filteredPOs: (PurchaseOrder & { calculatedUrgency: string; age: number })[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ filteredPOs }) => {
  const handleExport = () => {
    if (filteredPOs.length === 0) {
      alert("No data available to export with current filters.");
      return;
    }

    // Map the data to a clean format for Excel
    const exportData = filteredPOs.map(po => ({
      'PO Number': po.poNumber,
      'Urgency': po.calculatedUrgency,
      'Status': po.status,
      'Order Date': po.creationDate,
      'Due Date': po.deliveryDate,
      'Vendor Name': po.vendor,
      'Item Code': po.itemCode || '',
      'Quantity': po.quantity || 0,
      'Pending Qty': po.pendingQuantity || 0,
      'Unit Price': po.unitPrice || 0,
      'Currency': po.currency || 'USD',
      'Total Amount': po.totalAmount,
      'Description': po.itemDescription || '',
      'Age (Days)': po.age
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const wscols = [
      { wch: 15 }, // PO Number
      { wch: 15 }, // Urgency
      { wch: 12 }, // Status
      { wch: 12 }, // Order Date
      { wch: 12 }, // Due Date
      { wch: 25 }, // Vendor
      { wch: 15 }, // Item Code
      { wch: 10 }, // Qty
      { wch: 10 }, // Pending
      { wch: 10 }, // Price
      { wch: 8 },  // Curr
      { wch: 12 }, // Total
      { wch: 40 }, // Description
      { wch: 10 }, // Age
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered_POs");

    // Generate filename with current date and filter context
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `PO_Sentinel_Export_${dateStr}.xlsx`);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center space-x-2 px-3 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 font-bold text-sm transition-all active:scale-95 shadow-sm"
      title="Export filtered results to Excel"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="hidden lg:inline">Download Excel</span>
    </button>
  );
};

export default ExportButton;
