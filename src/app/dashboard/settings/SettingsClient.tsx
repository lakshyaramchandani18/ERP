'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Download,
  Upload,
  FolderOpen,
  CloudUpload,
  RefreshCw,
  Lock,
  HardDrive,
  ShieldCheck,
  Clock,
  Key,
  Printer,
  Sliders,
  Eye,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  FileText,
  FileCode,
  Star,
} from 'lucide-react';
import {
  InvoiceTemplateHub,
  InvoiceTemplateConfig,
  defaultTemplateConfig,
  TemplateFormat,
} from '@/components/invoice/InvoiceTemplateHub';

export default function SettingsClient({ settings: initialSettings }: { settings: any }) {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [dataPaths, setDataPaths] = useState<any>(null);
  const [localBackups, setLocalBackups] = useState<any[]>([]);
  const [cloudBackups, setCloudBackups] = useState<any[]>([]);
  const [customUploadedTemplates, setCustomUploadedTemplates] = useState<any[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  // Upload Custom Template Modal state
  const [showCustomUploadModal, setShowCustomUploadModal] = useState(false);
  const [customTempName, setCustomTempName] = useState('');
  const [customTempPaperSize, setCustomTempPaperSize] = useState('A4');
  const [customTempOrientation, setCustomTempOrientation] = useState('Portrait');
  const [customTempNotes, setCustomTempNotes] = useState('');
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // Backup modal / options
  const [encryptBackup, setEncryptBackup] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [includeUploads, setIncludeUploads] = useState(true);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Restore modal / options
  const [restorePassword, setRestorePassword] = useState('');
  const [selectedFileForRestore, setSelectedFileForRestore] = useState<string | null>(null);
  const [isCloudRestore, setIsCloudRestore] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Settings State
  const [schedule, setSchedule] = useState('OFF');
  const [gdriveEnabled, setGdriveEnabled] = useState(false);
  const [gdriveAutoUpload, setGdriveAutoUpload] = useState(false);
  const [gdriveClientId, setGdriveClientId] = useState('');
  const [gdriveClientSecret, setGdriveClientSecret] = useState('');
  const [gdriveRefreshToken, setGdriveRefreshToken] = useState('');

  // Invoice Designer Multi-Template State
  const [templates, setTemplates] = useState<InvoiceTemplateConfig[]>([
    { ...defaultTemplateConfig, id: 'template-80mm-default', name: '80mm Thermal Receipt (Default)', isDefault: true, format: '80MM_THERMAL' },
    { ...defaultTemplateConfig, id: 'template-a4-formal', name: 'A4 GST Tax Invoice', isDefault: false, format: 'A4_PORTRAIT' },
    { ...defaultTemplateConfig, id: 'template-58mm', name: '58mm Express Receipt', isDefault: false, format: '58MM_THERMAL' },
    { ...defaultTemplateConfig, id: 'template-a5-landscape', name: 'A5 Landscape Invoice', isDefault: false, format: 'A5_LANDSCAPE' },
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('template-80mm-default');
  const [activeTab, setActiveTab] = useState<'invoice' | 'custom' | 'backup' | 'gdrive'>('invoice');

  // Dummy Sale Object for Live Preview
  const previewSale = {
    invoiceNumber: 'INV-20260730-0001',
    saleDate: new Date(),
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    subTotal: 2450.0,
    totalDiscount: 150.0,
    totalTax: 115.0,
    grandTotal: 2415.0,
    customer: {
      name: 'Rahul Sharma',
      mobile: '+91 98765 12345',
      email: 'rahul@example.com',
      address: 'B-42, Sector 15, Connaught Place, New Delhi',
      gst: '07AAAAA0000A1Z5',
    },
    items: [
      {
        id: '1',
        quantity: 2,
        unitPrice: 999.0,
        discount: 100.0,
        taxPercent: 5,
        total: 1898.0,
        variant: {
          sku: 'SHIRT-BLU-M',
          color: { name: 'Navy Blue' },
          size: { name: 'M' },
          product: { name: 'Slim Fit Formal Cotton Shirt', hsnCode: '6205' },
        },
      },
      {
        id: '2',
        quantity: 1,
        unitPrice: 599.0,
        discount: 50.0,
        taxPercent: 5,
        total: 517.0,
        variant: {
          sku: 'JEANS-BLK-32',
          color: { name: 'Black' },
          size: { name: '32' },
          product: { name: 'Stretchable Denim Jeans', hsnCode: '6203' },
        },
      },
    ],
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      api.getAppDataPaths().then((paths: any) => setDataPaths(paths));
      api.getSettings().then((s: any) => {
        if (s) {
          setSchedule(s.autoBackupSchedule || 'OFF');
          if (s.invoiceTemplates && Array.isArray(s.invoiceTemplates) && s.invoiceTemplates.length > 0) {
            setTemplates(s.invoiceTemplates);
            const def = s.invoiceTemplates.find((t: any) => t.isDefault) || s.invoiceTemplates[0];
            setSelectedTemplateId(def.id);
          }
          if (s.gdrive) {
            setGdriveEnabled(s.gdrive.enabled || false);
            setGdriveAutoUpload(s.gdrive.autoUpload || false);
            setGdriveClientId(s.gdrive.clientId || '');
            setGdriveClientSecret(s.gdrive.clientSecret || '');
            setGdriveRefreshToken(s.gdrive.tokens?.refresh_token || '');
          }
        }
      });
      loadLocalBackups();
      loadCustomTemplates();
    }
  }, []);

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const loadLocalBackups = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const list = await (window as any).electronAPI.listLocalBackups();
      setLocalBackups(list || []);
    }
  };

  const loadCustomTemplates = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const list = await (window as any).electronAPI.listCustomTemplates();
      setCustomUploadedTemplates(list || []);
    }
  };

  const loadCloudBackups = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      setIsLoadingCloud(true);
      const res = await (window as any).electronAPI.listGDriveBackups();
      setIsLoadingCloud(false);
      if (res.success) {
        setCloudBackups(res.files || []);
      } else {
        setStatusMsg(res.offline ? 'Offline: Unable to fetch Google Drive backups.' : `Cloud fetch failed: ${res.error}`);
      }
    }
  };

  const handleSaveSettings = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const s = await (window as any).electronAPI.getSettings();
      const updated = {
        ...s,
        shopName: currentTemplate.shopName,
        gst: currentTemplate.gstin,
        pan: currentTemplate.pan,
        autoBackupSchedule: schedule,
        invoiceTemplates: templates,
        invoiceConfig: currentTemplate,
        gdrive: {
          enabled: gdriveEnabled,
          autoUpload: gdriveAutoUpload,
          clientId: gdriveClientId,
          clientSecret: gdriveClientSecret,
          tokens: gdriveRefreshToken ? { refresh_token: gdriveRefreshToken } : null,
        },
      };
      await (window as any).electronAPI.saveSettings(updated);
      setStatusMsg('Invoice Designer & ERP Settings saved successfully.');
    }
  };

  const updateSelectedTemplate = (key: keyof InvoiceTemplateConfig, value: any) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplateId ? { ...t, [key]: value } : t))
    );
  };

  // Template Actions
  const handleCreateTemplate = () => {
    const name = prompt('Enter New Invoice Template Name:', 'Custom Bill Template');
    if (!name) return;
    const newId = `template-${Date.now()}`;
    const newT: InvoiceTemplateConfig = {
      ...defaultTemplateConfig,
      id: newId,
      name,
      isDefault: false,
      format: '80MM_THERMAL',
    };
    setTemplates([...templates, newT]);
    setSelectedTemplateId(newId);
  };

  const handleDuplicateTemplate = () => {
    const name = prompt('Enter Name for Duplicated Template:', `${currentTemplate.name} (Copy)`);
    if (!name) return;
    const newId = `template-${Date.now()}`;
    const newT: InvoiceTemplateConfig = {
      ...currentTemplate,
      id: newId,
      name,
      isDefault: false,
    };
    setTemplates([...templates, newT]);
    setSelectedTemplateId(newId);
  };

  const handleDeleteTemplate = () => {
    if (templates.length <= 1) {
      alert('You must keep at least one invoice template.');
      return;
    }
    if (currentTemplate.isDefault) {
      alert('Cannot delete default template.');
      return;
    }
    if (confirm(`Delete template "${currentTemplate.name}"?`)) {
      const next = templates.filter((t) => t.id !== selectedTemplateId);
      setTemplates(next);
      setSelectedTemplateId(next[0].id);
    }
  };

  const handleSetDefault = () => {
    setTemplates((prev) =>
      prev.map((t) => ({ ...t, isDefault: t.id === selectedTemplateId }))
    );
    setStatusMsg(`"${currentTemplate.name}" is now the default printing template.`);
  };

  // Upload Custom PDF / DOCX Template File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    if (!customTempName) setCustomTempName(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedFileBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadCustomTemplate = async () => {
    if (!selectedFileBase64) {
      alert('Please select a PDF (.pdf) or Word (.docx) template file.');
      return;
    }

    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const res = await (window as any).electronAPI.uploadCustomTemplate({
        fileBase64: selectedFileBase64,
        fileName: selectedFileName,
        templateName: customTempName,
        paperSize: customTempPaperSize,
        orientation: customTempOrientation,
        notes: customTempNotes,
      });

      setShowCustomUploadModal(false);
      setSelectedFileBase64(null);
      setSelectedFileName('');
      setCustomTempName('');
      setCustomTempNotes('');

      if (res.success) {
        setStatusMsg(`Uploaded custom template "${res.template.name}" successfully!`);
        loadCustomTemplates();
      } else {
        setStatusMsg(`Upload failed: ${res.error}`);
      }
    }
  };

  const handleDeleteCustomUploadedTemplate = async (id: string) => {
    if (confirm('Delete this uploaded custom template?')) {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const res = await (window as any).electronAPI.deleteCustomTemplate(id);
        if (res.success) {
          setStatusMsg('Custom template deleted.');
          loadCustomTemplates();
        }
      }
    }
  };

  const handleCreateBackup = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const res = await (window as any).electronAPI.createBackup({
        encrypt: encryptBackup,
        password: backupPassword,
        includeUploads,
      });

      setShowBackupModal(false);
      setBackupPassword('');

      if (res.success) {
        setStatusMsg(`Backup created successfully: ${res.fileName}`);
        loadLocalBackups();
      } else {
        setStatusMsg(`Backup failed: ${res.error}`);
      }
    }
  };

  const handleOpenFolder = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      await (window as any).electronAPI.openBackupFolder();
    }
  };

  const handleUploadToCloud = async (fileName: string) => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      setStatusMsg(`Uploading ${fileName} to Google Drive...`);
      const res = await (window as any).electronAPI.uploadToGDrive(fileName);
      if (res.success) {
        setStatusMsg(`Successfully uploaded ${fileName} to Google Drive.`);
        loadCloudBackups();
      } else {
        setStatusMsg(`Google Drive upload failed: ${res.error}`);
      }
    }
  };

  const startRestoreProcess = (filePathOrId: string, cloud = false) => {
    setSelectedFileForRestore(filePathOrId);
    setIsCloudRestore(cloud);
    setRestorePassword('');
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI && selectedFileForRestore) {
      setShowRestoreModal(false);

      if (isCloudRestore) {
        setStatusMsg('Downloading and restoring backup from Google Drive...');
        const res = await (window as any).electronAPI.restoreFromGDrive({
          fileId: selectedFileForRestore,
          password: restorePassword,
        });
        if (!res.success) setStatusMsg(`Cloud restore failed: ${res.error}`);
      } else {
        const res = await (window as any).electronAPI.restoreBackup({
          filePath: selectedFileForRestore,
          password: restorePassword,
        });
        if (!res.success) setStatusMsg(`Local restore failed: ${res.error}`);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ERP Settings & Custom Invoice Templates</h1>
        <p className="text-sm text-muted-foreground">
          Design bills, upload custom PDF & Word (.docx) templates with placeholder tags, manage backups, and cloud sync.
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl border bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            {statusMsg}
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-xs underline opacity-70">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('invoice')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'invoice'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Printer className="h-4 w-4" /> Invoice Designer
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'custom'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileCode className="h-4 w-4" /> Upload Custom Templates (.PDF / .DOCX)
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'backup'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <HardDrive className="h-4 w-4" /> Backup & Restore Manager
        </button>

        <button
          onClick={() => setActiveTab('gdrive')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'gdrive'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CloudUpload className="h-4 w-4" /> Google Drive Cloud Sync
        </button>
      </div>

      {/* TAB 1: INVOICE DESIGNER & TEMPLATES */}
      {activeTab === 'invoice' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold">Select Active Template:</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.isDefault ? '★ (Default)' : ''}
                  </option>
                ))}
              </select>

              {currentTemplate.isDefault ? (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" /> Default Template
                </span>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={handleSetDefault}>
                  Set as Default
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCreateTemplate} className="flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> New Template
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDuplicateTemplate} className="flex items-center gap-1">
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </Button>
              {!currentTemplate.isDefault && (
                <Button type="button" variant="outline" size="sm" onClick={handleDeleteTemplate} className="text-red-600 hover:bg-red-50 flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              )}
              <Button type="button" onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save All Templates
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-blue-600" /> Template Configuration (`{currentTemplate.name}`)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Template Name</label>
                    <Input
                      value={currentTemplate.name}
                      onChange={(e) => updateSelectedTemplate('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Paper Format & Orientation</label>
                    <select
                      value={currentTemplate.format}
                      onChange={(e) => updateSelectedTemplate('format', e.target.value as TemplateFormat)}
                      className="w-full h-10 rounded-md border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="A4_PORTRAIT">A4 Portrait (210mm x 297mm)</option>
                      <option value="A4_LANDSCAPE">A4 Landscape (297mm x 210mm)</option>
                      <option value="A5_PORTRAIT">A5 Portrait (148mm x 210mm)</option>
                      <option value="A5_LANDSCAPE">A5 Landscape (210mm x 148mm)</option>
                      <option value="80MM_THERMAL">80mm Thermal Receipt</option>
                      <option value="58MM_THERMAL">58mm Thermal Receipt</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Shop Name</label>
                    <Input value={currentTemplate.shopName} onChange={(e) => updateSelectedTemplate('shopName', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Phone Number</label>
                    <Input value={currentTemplate.shopPhone} onChange={(e) => updateSelectedTemplate('shopPhone', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Email Address</label>
                    <Input value={currentTemplate.shopEmail} onChange={(e) => updateSelectedTemplate('shopEmail', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">GSTIN Number</label>
                    <Input value={currentTemplate.gstin} onChange={(e) => updateSelectedTemplate('gstin', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">PAN Number</label>
                    <Input value={currentTemplate.pan} onChange={(e) => updateSelectedTemplate('pan', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">UPI ID (for Payment QR)</label>
                    <Input value={currentTemplate.upiId} onChange={(e) => updateSelectedTemplate('upiId', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Shop Address</label>
                  <textarea
                    value={currentTemplate.shopAddress}
                    onChange={(e) => updateSelectedTemplate('shopAddress', e.target.value)}
                    className="w-full h-16 rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Footer Thank You Message</label>
                  <Input value={currentTemplate.footerMessage} onChange={(e) => updateSelectedTemplate('footerMessage', e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Terms & Conditions</label>
                  <textarea
                    value={currentTemplate.termsAndConditions}
                    onChange={(e) => updateSelectedTemplate('termsAndConditions', e.target.value)}
                    className="w-full h-16 rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-4 border-t space-y-3">
                  <h3 className="text-sm font-semibold">Field Visibility Controls</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { key: 'showShopName', label: 'Shop Name' },
                      { key: 'showShopAddress', label: 'Shop Address' },
                      { key: 'showGst', label: 'GSTIN Number' },
                      { key: 'showPhone', label: 'Phone Number' },
                      { key: 'showEmail', label: 'Email Address' },
                      { key: 'showCustomerName', label: 'Customer Name' },
                      { key: 'showCustomerPhone', label: 'Customer Phone' },
                      { key: 'showCustomerAddress', label: 'Customer Address' },
                      { key: 'showInvoiceNo', label: 'Invoice Number' },
                      { key: 'showInvoiceDate', label: 'Invoice Date' },
                      { key: 'showHsn', label: 'HSN Code Column' },
                      { key: 'showDiscount', label: 'Item Discount' },
                      { key: 'showTaxDetails', label: 'Tax Breakdown' },
                      { key: 'showPaymentMethod', label: 'Payment Method' },
                      { key: 'showBarcode', label: 'Invoice Barcode' },
                      { key: 'showQrCode', label: 'UPI Payment QR Code' },
                      { key: 'showSignature', label: 'Authorized Signature' },
                      { key: 'showTerms', label: 'Terms & Conditions' },
                      { key: 'showFooter', label: 'Footer Message' },
                    ].map((field) => (
                      <label key={field.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(currentTemplate as any)[field.key]}
                          onChange={(e) => updateSelectedTemplate(field.key as any, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        {field.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-4 sticky top-6">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-gray-900 dark:text-white">
                    <Eye className="h-4 w-4 text-blue-600" /> Live Print Output Preview
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase">
                    {currentTemplate.format}
                  </span>
                </div>

                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto flex justify-center max-h-[720px] overflow-y-auto">
                  <div className="shadow-xl bg-white rounded">
                    <InvoiceTemplateHub sale={previewSale} config={currentTemplate} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD CUSTOM TEMPLATES (.PDF / .DOCX) */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-purple-600" /> Custom File Templates (`Documents/ClothShop ERP/Invoice Templates/`)
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your own PDF background templates or Word (.docx) invoices with placeholder tags like <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-purple-600">{"{{INVOICE_NUMBER}}"}</code>.
                </p>
              </div>

              <Button type="button" onClick={() => setShowCustomUploadModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                <Upload className="h-4 w-4" /> Upload PDF / DOCX Template
              </Button>
            </div>
          </div>

          {/* Placeholders Field Reference Sheet */}
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Supported Placeholder Tags for Word (.docx) & PDF Mappings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-purple-800 dark:text-purple-300">
              <span className="bg-white/80 p-1.5 rounded border">{"{{SHOP_NAME}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{SHOP_ADDRESS}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{GST_NUMBER}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{PHONE}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{EMAIL}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{CUSTOMER_NAME}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{CUSTOMER_PHONE}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{CUSTOMER_ADDRESS}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{INVOICE_NUMBER}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{INVOICE_DATE}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{PAYMENT_METHOD}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border font-bold text-purple-900">{"{{PRODUCT_TABLE}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{SUBTOTAL}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{DISCOUNT}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border">{"{{GST}}"}</span>
              <span className="bg-white/80 p-1.5 rounded border font-bold text-purple-900">{"{{GRAND_TOTAL}}"}</span>
            </div>
          </div>

          {/* Uploaded Custom Templates Table */}
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-base font-bold">Uploaded Custom Templates</h3>

            {customUploadedTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No custom PDF or DOCX templates uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900 border-b">
                    <tr>
                      <th className="px-4 py-3">Template Name</th>
                      <th className="px-4 py-3">File Type</th>
                      <th className="px-4 py-3">Paper Size</th>
                      <th className="px-4 py-3">Uploaded Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customUploadedTemplates.map((ct) => (
                      <tr key={ct.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-3 font-semibold">{ct.name}</td>
                        <td className="px-4 py-3 font-mono text-xs uppercase">{ct.fileType}</td>
                        <td className="px-4 py-3 text-xs">{ct.paperSize} ({ct.orientation})</td>
                        <td className="px-4 py-3 text-xs">{new Date(ct.uploadDate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomUploadedTemplate(ct.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-6 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <HardDrive className="h-5 w-5 text-blue-300" />
                Isolated Local Storage Location
              </div>
              <p className="text-xs text-blue-200">
                All user data, SQLite database, uploads, and backups are stored separately in your Documents folder to guarantee safety during application updates.
              </p>
              <div className="text-xs font-mono bg-black/30 px-3 py-1.5 rounded-lg mt-2 inline-block">
                {dataPaths?.dataDir || 'Documents/ClothShop ERP/'}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Backup & Restore Toolbar</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setShowBackupModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Backup Now
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => startRestoreProcess('', false)}
                className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Restore Backup File
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleOpenFolder}
                className="flex items-center gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Open Backup Folder
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              Automatic Backup Schedule
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Backup Frequency</label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full h-10 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="OFF">Disabled (Manual Only)</option>
                  <option value="DAILY">Daily Automatic Backup</option>
                  <option value="WEEKLY">Weekly Automatic Backup</option>
                  <option value="MONTHLY">Monthly Automatic Backup</option>
                </select>
              </div>

              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={gdriveAutoUpload}
                    onChange={(e) => setGdriveAutoUpload(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Auto-upload local backups to Google Drive when created
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-emerald-600" />
              Local Backup Archives (`Documents/ClothShop ERP/backups/`)
            </h2>

            {localBackups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No local backups generated yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900 border-b">
                    <tr>
                      <th className="px-4 py-3">File Name</th>
                      <th className="px-4 py-3">Created At</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Security</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {localBackups.map((b) => (
                      <tr key={b.fileName} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-3 font-mono font-medium">{b.fileName}</td>
                        <td className="px-4 py-3">{new Date(b.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">{(b.size / (1024 * 1024)).toFixed(2)} MB</td>
                        <td className="px-4 py-3">
                          {b.isEncrypted ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold">
                              <Lock className="h-3 w-3" /> AES-256
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Standard ZIP</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUploadToCloud(b.fileName)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <CloudUpload className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startRestoreProcess(b.filePath, false)}
                            className="text-emerald-700 border-emerald-600 hover:bg-emerald-50"
                          >
                            Restore
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GOOGLE DRIVE CLOUD SYNC */}
      {activeTab === 'gdrive' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <CloudUpload className="h-5 w-5 text-blue-600" />
                Google Drive Cloud Backup Integration
              </div>
              <Button type="button" variant="outline" size="sm" onClick={loadCloudBackups} className="flex items-center gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingCloud ? 'animate-spin' : ''}`} />
                Refresh Cloud List
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">OAuth Client ID</label>
                <Input
                  type="text"
                  placeholder="Google OAuth Client ID"
                  value={gdriveClientId}
                  onChange={(e) => setGdriveClientId(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">OAuth Client Secret</label>
                <Input
                  type="password"
                  placeholder="Google Client Secret"
                  value={gdriveClientSecret}
                  onChange={(e) => setGdriveClientSecret(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Refresh Token</label>
                <Input
                  type="password"
                  placeholder="User Refresh Token"
                  value={gdriveRefreshToken}
                  onChange={(e) => setGdriveRefreshToken(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={gdriveEnabled}
                  onChange={(e) => setGdriveEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Enable Google Drive Integration
              </label>

              <Button type="button" onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Cloud Settings
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CloudUpload className="h-5 w-5 text-blue-600" />
              Google Drive Cloud Backups (`ClothShop_ERP_Backups`)
            </h2>

            {cloudBackups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No cloud backups found or Google Drive not synced. Click "Refresh Cloud List" above to fetch.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900 border-b">
                    <tr>
                      <th className="px-4 py-3">Cloud File Name</th>
                      <th className="px-4 py-3">Uploaded At</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cloudBackups.map((cb) => (
                      <tr key={cb.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-3 font-mono font-medium">{cb.fileName}</td>
                        <td className="px-4 py-3">{new Date(cb.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">{(cb.size / (1024 * 1024)).toFixed(2)} MB</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startRestoreProcess(cb.id, true)}
                            className="text-blue-700 border-blue-600 hover:bg-blue-50"
                          >
                            Restore from Cloud
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Custom PDF / DOCX Template Modal */}
      {showCustomUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" /> Upload Custom PDF / DOCX Template
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Template Display Name</label>
                <Input
                  type="text"
                  placeholder="e.g. My Wholesale Invoice Template"
                  value={customTempName}
                  onChange={(e) => setCustomTempName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Paper Size</label>
                  <select
                    value={customTempPaperSize}
                    onChange={(e) => setCustomTempPaperSize(e.target.value)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-xs"
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="80mm">80mm Thermal</option>
                    <option value="58mm">58mm Thermal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Orientation</label>
                  <select
                    value={customTempOrientation}
                    onChange={(e) => setCustomTempOrientation(e.target.value)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-xs"
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Select File (.pdf or .docx)</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Notes / Instructions</label>
                <Input
                  type="text"
                  placeholder="e.g. Use for GST wholesale customers"
                  value={customTempNotes}
                  onChange={(e) => setCustomTempNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => setShowCustomUploadModal(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleUploadCustomTemplate} className="bg-purple-600 hover:bg-purple-700 text-white">
                Upload & Register Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold">Generate Backup Archive</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUploads}
                  onChange={(e) => setIncludeUploads(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                Include local product images & documents (`uploads/`)
              </label>

              <div className="pt-2 border-t space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={encryptBackup}
                    onChange={(e) => setEncryptBackup(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600"
                  />
                  Enable AES-256 Password Encryption
                </label>

                {encryptBackup && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Encryption Password</label>
                    <Input
                      type="password"
                      placeholder="Set AES-256 Encryption Password"
                      value={backupPassword}
                      onChange={(e) => setBackupPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => setShowBackupModal(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateBackup} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Create Backup Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2">
              <Upload className="h-5 w-5" /> Confirm Restore Operation
            </h3>

            <p className="text-xs text-muted-foreground">
              Restoring a backup will overwrite your current SQLite database and local uploads, then restart the desktop app automatically.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <Key className="h-3.5 w-3.5" /> Decryption Password (If Encrypted)
              </label>
              <Input
                type="password"
                placeholder="Enter AES-256 password if applicable"
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => setShowRestoreModal(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={confirmRestore} className="bg-amber-600 hover:bg-amber-700 text-white">
                Overwrite & Restore
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
