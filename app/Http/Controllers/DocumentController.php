<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $category = (string) $request->query('category', 'all');
        $search = trim((string) $request->query('search', ''));
        $documents = Document::with('documentType')->where('user_id', $user->id)
            ->when($category !== 'all', fn ($q) => $q->whereHas('documentType', fn ($t) => $t->where('category', $category)))
            ->when($search !== '', fn ($q) => $q->where('document_name', 'like', "%{$search}%"))
            ->latest()->paginate(10)->withQueryString();
        $all = Document::where('user_id', $user->id);
        $counts = ['all' => (clone $all)->count()];
        foreach (['Personal', 'Employment', 'Training'] as $name) {
            $counts[$name] = (clone $all)->whereHas('documentType', fn ($q) => $q->where('category', $name))->count();
        }

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'types' => DocumentType::orderBy('document_type_name')->get(['document_type_id', 'document_type_name', 'category']),
            'filters' => ['category' => $category, 'search' => $search],
            'counts' => $counts,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'document_type_id' => ['required', 'integer', 'exists:document_types,document_type_id'],
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);
        $file = $data['document'];
        $path = $file->store('documents/' . $request->user()->id, 'local');
        Document::create([
            'user_id' => $request->user()->id,
            'document_type_id' => $data['document_type_id'],
            'document_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'file_size' => $file->getSize(),
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($request->user()->hasRole('Manager') || $document->user_id === $request->user()->id, 403);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);
        return Storage::disk('local')->response($document->file_path, $document->document_name, ['Content-Type' => $document->mime_type]);
    }

    public function download(Request $request, Document $document)
    {
        abort_unless($request->user()->hasRole('Manager') || $document->user_id === $request->user()->id, 403);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);
        return Storage::disk('local')->download($document->file_path, $document->document_name);
    }

    public function manage(Request $request)
    {
        $category = (string) $request->query('category', 'all');
        $search = trim((string) $request->query('search', ''));
        $documents = Document::with(['user', 'documentType'])
            ->when($category !== 'all', fn ($q) => $q->whereHas('documentType', fn ($t) => $t->where('category', $category)))
            ->when($search !== '', fn ($q) => $q->where(function ($sub) use ($search) {
                $sub->where('document_name', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('employee_name', 'like', "%{$search}%")->orWhere('employee_id', 'like', "%{$search}%"));
            }))
            ->latest()->paginate(15)->withQueryString();
        $counts = ['all' => Document::count()];
        foreach (['Personal', 'Employment', 'Training'] as $name) {
            $counts[$name] = Document::whereHas('documentType', fn ($q) => $q->where('category', $name))->count();
        }
        return Inertia::render('Documents/Manage', [
            'documents' => $documents,
            'filters' => ['category' => $category, 'search' => $search],
            'counts' => $counts,
        ]);
    }
}
