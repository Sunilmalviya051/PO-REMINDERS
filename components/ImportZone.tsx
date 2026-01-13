
import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { PurchaseOrder, POStatus, POPriority } from '../types';

interface ImportZoneProps {
  onImport: (pos: Omit<PurchaseOrder, 'id'>[]) => void;
}

const ImportZone: React.FC<ImportZoneProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        // cellDates: true ensures Excel's native date format is preserved as a JS Date object
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true, dateNF: 'yyyy-mm-dd' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const mappedPOs: Omit<PurchaseOrder, 'id'>[] = data.map((row: any) => {
          const poNumber = String(row.PONumber || row['PO Number'] || row.PO_Number || row.OrderNumber || row.Order_No || `PO-${Math.floor(Math.random() * 10000)}`);
          const vendor = String(row.VendorName || row['Vendor Name'] || row.Vendor || row.Supplier || row['Supplier Name'] || 'Unknown Vendor');
          
          // If cellDates is true, these might already be JS Date objects
          const rawCreationDate = row.PODate || row['Order Date'] || row['PO Date'] || row.OrderDate || row.PO_Date || row.CreationDate || row['Creation Date'] || row.DateCreated;
          const creationDate = rawCreationDate instanceof Date ? rawCreationDate.toISOString().split('T')[0] : String(rawCreationDate || new Date().toISOString().split('T')[0]);
          
          const rawApproveDate = row.ApproveDate || row['Approve Date'];
          const approveDate = rawApproveDate instanceof Date ? rawApproveDate.toISOString().split('T')[0] : String(rawApproveDate || '');
          
          const rawDeliveryDate = row.DeliveryDate || row['Delivery Date'] || row.DueDate || row['Due Date'];
          let deliveryDate = rawDeliveryDate instanceof Date ? rawDeliveryDate.toISOString().split('T')[0] : String(rawDeliveryDate || '');

          if (!deliveryDate || deliveryDate === 'undefined') {
            const date = new Date(creationDate);
            if (!isNaN(date.getTime())) {
              date.setDate(date.getDate() + 30);
              deliveryDate = date.toISOString().split('T')[0];
            }
          }
          
          // New field mappings
          const itemCode = String(row.ItemCode || row['Item Code'] || row.PartNumber || row.Code || '');
          const unitPrice = parseFloat(String(row.UnitPrice || row['Unit Price'] || row.Rate || '0').replace(/[^0-9.-]+/g,""));
          const currency = String(row.Currency || row.Curr || '');
          const quantity = parseFloat(String(row.Quantity || row.Qty || '0').replace(/[^0-9.-]+/g,""));
          const uom = String(row.UOM || row.Unit || row['Unit of Measure'] || '');
          const itemDescription = String(row.ItemDescription || row['Item Description'] || row.Description || '');
          const pendingQuantity = parseFloat(String(row.PendingQuantity || row['Pending Quantity'] || row.Pending || '0').replace(/[^0-9.-]+/g,""));

          let status = POStatus.PENDING;
          const rawStatus = String(row.Status || row.State || '').toLowerCase();
          if (rawStatus.includes('draft')) status = POStatus.DRAFT;
          else if (rawStatus.includes('pending')) status = POStatus.PENDING;
          else if (rawStatus.includes('approved')) status = POStatus.APPROVED;
          else if (rawStatus.includes('shipped')) status = POStatus.SHIPPED;
          else if (rawStatus.includes('delivered')) status = POStatus.DELIVERED;
          else if (rawStatus.includes('overdue')) status = POStatus.OVERDUE;
          else if (rawStatus.includes('cancelled')) status = POStatus.CANCELLED;

          let priority = POPriority.MEDIUM;
          const rawPriority = String(row.Priority || row.Urgency || '').toLowerCase();
          if (rawPriority.includes('high')) priority = POPriority.HIGH;
          else if (rawPriority.includes('low')) priority = POPriority.LOW;

          const totalAmount = unitPrice * quantity;

          return {
            poNumber,
            vendor,
            creationDate,
            approveDate,
            deliveryDate,
            status,
            priority,
            totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
            items: [],
            itemCode,
            unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
            currency,
            quantity: isNaN(quantity) ? 0 : quantity,
            uom,
            itemDescription,
            pendingQuantity: isNaN(pendingQuantity) ? 0 : pendingQuantity,
            notes: row.Notes || '',
          };
        });

        onImport(mappedPOs);
        alert(`Successfully imported ${mappedPOs.length} records.`);
      } catch (err) {
        console.error("Excel Import Error:", err);
        alert("Failed to parse the file. Please check column headers.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex items-center">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv, .xlsx, .xls"
        className="hidden"
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-2 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm transition-all active:scale-95"
        title="Import Excel/CSV with sentinel headers"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        <span className="hidden lg:inline">Import Excel</span>
      </button>
    </div>
  );
};

export default ImportZone;
