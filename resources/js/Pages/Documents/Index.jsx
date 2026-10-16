import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';
import '../../../css/documents.css';

export default function DocumentsIndex({ documents, types, filters, counts }) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const form = useForm({ document_type_id: '', document: null });
    const category = filters?.category || 'all';
    const search = filters?.search || '';
    const changeFilter = (key, value) => router.get(route('documents.index'), { category: key === 'category' ? value : category, search: key === 'search' ? value : search }, { preserveState: true, preserveScroll: true, replace: true });
    const submit = (e) => {
        e.preventDefault();
        form.post(route('documents.store'), { forceFormData: true, preserveScroll: true, onSuccess: () => { form.reset(); setUploadOpen(false); } });
    };
    const prettySize = (bytes) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return <AppLayout title="My Documents">
        <div className="docs-page">
            <section className="docs-hero"><div><span className="docs-eyebrow">EMPLOYEE DOCUMENTS</span><h2>Keep your documents organized.</h2><p>Upload, filter, view, and download your important work documents securely.</p></div><button className="docs-primary" onClick={() => setUploadOpen(true)}><i className="bi bi-cloud-arrow-up"/> Upload New Document</button></section>
            <div className="docs-stats">
                {[['all','All Documents','bi-files'],['Personal','Personal Documents','bi-person-vcard'],['Employment','Employment Documents','bi-briefcase'],['Training','Training & Certificates','bi-award']].map(([key,label,icon]) => <button type="button" key={key} className={`docs-stat ${category === key ? 'selected' : ''}`} onClick={() => changeFilter('category',key)}><span className="docs-stat-icon"><i className={`bi ${icon}`}/></span><span><small>{label}</small><strong>{counts?.[key] ?? 0}</strong></span></button>)}
            </div>
            <section className="docs-panel"><div className="docs-panel-head"><div><h3>Your Uploaded Documents</h3><p>PDF, JPG, JPEG, or PNG · Maximum file size 10 MB</p></div><label className="docs-search"><i className="bi bi-search"/><input defaultValue={search} placeholder="Search document name..." onKeyDown={e => { if (e.key === 'Enter') changeFilter('search', e.currentTarget.value); }}/><button type="button" onClick={e => changeFilter('search', e.currentTarget.previousSibling.value)}>Search</button></label></div>
                <div className="docs-table-wrap"><table className="docs-table"><thead><tr><th>Document</th><th>Category</th><th>Date Uploaded</th><th>File Size</th><th>Actions</th></tr></thead><tbody>{documents?.data?.length ? documents.data.map(doc => <tr key={doc.document_id}><td><span className="docs-file-icon"><i className="bi bi-file-earmark-text"/></span><span className="docs-file-name">{doc.document_name}</span></td><td><span className="docs-category">{doc.document_type?.category}</span></td><td>{new Date(doc.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td><td>{prettySize(doc.file_size || 0)}</td><td><div className="docs-row-actions"><a href={route('documents.show',doc.document_id)} target="_blank" rel="noreferrer" aria-label="View document" title="View"><i className="bi bi-eye"/></a><a href={route('documents.download',doc.document_id)} aria-label="Download document" title="Download"><i className="bi bi-download"/></a></div></td></tr>) : <tr><td colSpan="5" className="docs-empty"><i className="bi bi-folder2-open"/><strong>No documents found</strong><span>Upload a document or change your filters.</span></td></tr>}</tbody></table></div><div className="docs-pagination"><Pagination links={documents?.links || []}/></div>
            </section>
            <div className="docs-note"><i className="bi bi-shield-lock"/><span><strong>Your documents are private.</strong> Only you and authorized managers can access uploaded files.</span></div>
        </div>
        {uploadOpen && <div className="docs-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setUploadOpen(false); }}><section className="docs-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title"><button className="docs-modal-close" onClick={() => setUploadOpen(false)} type="button" aria-label="Close"><i className="bi bi-x-lg"/></button><div className="docs-modal-icon"><i className="bi bi-cloud-arrow-up"/></div><h3 id="upload-title">Upload a document</h3><p>Select the category and choose a file from your device.</p><form onSubmit={submit}><label>Document category<select required value={form.data.document_type_id} onChange={e => form.setData('document_type_id',e.target.value)}><option value="">Choose a category</option>{types.map(type => <option value={type.document_type_id} key={type.document_type_id}>{type.document_type_name}</option>)}</select>{form.errors.document_type_id && <small className="docs-error">{form.errors.document_type_id}</small>}</label><label className="docs-file-input">Choose file<input type="file" accept=".pdf,.jpg,.jpeg,.png" required onChange={e => form.setData('document',e.target.files?.[0] || null)}/><span>{form.data.document?.name || 'PDF, JPG or PNG (up to 10 MB)'}</span>{form.errors.document && <small className="docs-error">{form.errors.document}</small>}</label><div className="docs-modal-actions"><button type="button" className="docs-secondary" onClick={() => setUploadOpen(false)}>Cancel</button><button type="submit" className="docs-primary" disabled={form.processing}>{form.processing ? 'Uploading...' : 'Upload Document'}</button></div></form></section></div>}
    </AppLayout>;
}
