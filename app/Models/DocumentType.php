<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentType extends Model
{
    protected $primaryKey = 'document_type_id';
    protected $fillable = ['document_type_name', 'category'];

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'document_type_id');
    }
}
